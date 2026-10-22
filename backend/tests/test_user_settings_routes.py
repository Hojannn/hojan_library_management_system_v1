import unittest
import uuid
from io import BytesIO
from unittest.mock import MagicMock, patch

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app.blueprints.users.routes import users_bp
from app.models.user import User
from app.services.auth_service import AuthService


class PasswordServiceTests(unittest.TestCase):
    @patch("app.services.auth_service.db")
    def test_change_password_updates_hash(self, mock_db):
        user = User("Staff Member", "staff@example.com", password="old-password")
        mock_db.session.get.return_value = user

        AuthService.change_password(uuid.uuid4(), "old-password", "new-password")

        self.assertTrue(user.check_password("new-password"))
        self.assertFalse(user.check_password("old-password"))
        mock_db.session.commit.assert_called_once_with()

    @patch("app.services.auth_service.db")
    def test_change_password_rejects_wrong_current_password(self, mock_db):
        mock_db.session.get.return_value = User(
            "Staff Member", "staff@example.com", password="old-password"
        )

        with self.assertRaisesRegex(ValueError, "Current password is incorrect"):
            AuthService.change_password(uuid.uuid4(), "wrong-password", "new-password")

        mock_db.session.commit.assert_not_called()

    @patch("app.services.auth_service.db")
    def test_change_password_rejects_google_only_account(self, mock_db):
        mock_db.session.get.return_value = User(
            "Google Member", "google@example.com", google_id="google-123"
        )

        with self.assertRaisesRegex(ValueError, "managed by Google"):
            AuthService.change_password(uuid.uuid4(), "unused-password", "new-password")

        mock_db.session.commit.assert_not_called()


class PasswordRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, JWT_SECRET_KEY="test-secret")
        JWTManager(self.app)
        self.app.register_blueprint(users_bp)
        with self.app.app_context():
            self.user_id = uuid.uuid4()
            self.token = create_access_token(identity=str(self.user_id))
        self.client = self.app.test_client()

    @property
    def headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    @patch.object(AuthService, "change_password", create=True)
    def test_change_password_route_calls_service(self, change_password):
        response = self.client.put(
            "/api/users/me/password",
            json={
                "current_password": "old-password",
                "new_password": "new-password",
                "confirm_password": "new-password",
            },
            headers=self.headers,
        )

        self.assertEqual(response.status_code, 200)
        change_password.assert_called_once_with(
            self.user_id, "old-password", "new-password"
        )

    def test_change_password_rejects_short_mismatched_and_reused_passwords(self):
        cases = [
            ({"current_password": "old-password", "new_password": "short", "confirm_password": "short"}, "at least 8"),
            ({"current_password": "old-password", "new_password": "new-password", "confirm_password": "different-password"}, "do not match"),
            ({"current_password": "same-password", "new_password": "same-password", "confirm_password": "same-password"}, "must be different"),
        ]

        for payload, message in cases:
            with self.subTest(message=message):
                response = self.client.put(
                    "/api/users/me/password", json=payload, headers=self.headers
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn(message, response.get_json()["message"])


class ProfileAvatarRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, JWT_SECRET_KEY="test-secret")
        JWTManager(self.app)
        self.app.register_blueprint(users_bp)
        with self.app.app_context():
            self.user_id = uuid.uuid4()
            self.token = create_access_token(identity=str(self.user_id))
        self.client = self.app.test_client()

    @property
    def headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    @patch("app.blueprints.users.routes.delete_avatar")
    @patch("app.blueprints.users.routes.db")
    @patch("app.blueprints.users.routes.User")
    def test_remove_avatar_clears_url_after_commit(self, user_model, mock_db, delete_avatar):
        user = MagicMock(role="admin", avatar_url="https://cdn.example.com/old.png")
        user.to_dict.return_value = {"avatar_url": None}
        user_model.query.get_or_404.return_value = user

        response = self.client.put(
            "/api/users/me",
            data={"remove_avatar": "true"},
            headers=self.headers,
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(user.avatar_url)
        mock_db.session.commit.assert_called_once_with()
        delete_avatar.assert_called_once_with("https://cdn.example.com/old.png")

    @patch("app.blueprints.users.routes.upload_avatar", return_value="https://cdn.example.com/new.png")
    @patch("app.blueprints.users.routes.delete_avatar")
    @patch("app.blueprints.users.routes.db")
    @patch("app.blueprints.users.routes.User")
    def test_uploaded_avatar_wins_over_remove_flag(
        self, user_model, mock_db, delete_avatar, upload_avatar
    ):
        user = MagicMock(role="admin", avatar_url="https://cdn.example.com/old.png")
        user.to_dict.return_value = {"avatar_url": "https://cdn.example.com/new.png"}
        user_model.query.get_or_404.return_value = user

        response = self.client.put(
            "/api/users/me",
            data={
                "remove_avatar": "true",
                "avatar": (BytesIO(b"image"), "avatar.png", "image/png"),
            },
            headers=self.headers,
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(user.avatar_url, "https://cdn.example.com/new.png")
        upload_avatar.assert_called_once()
        mock_db.session.commit.assert_called_once_with()
        delete_avatar.assert_called_once_with("https://cdn.example.com/old.png")


if __name__ == "__main__":
    unittest.main()
