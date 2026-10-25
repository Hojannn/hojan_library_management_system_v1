import unittest
import uuid
from unittest.mock import patch

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app.blueprints.category.routes import category_bp


class CategoryRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, JWT_SECRET_KEY="test-secret")
        JWTManager(self.app)
        self.app.register_blueprint(category_bp)
        with self.app.app_context():
            self.admin_token = create_access_token(
                identity=str(uuid.uuid4()), additional_claims={"role": "admin"}
            )
            self.librarian_token = create_access_token(
                identity=str(uuid.uuid4()), additional_claims={"role": "librarian"}
            )
        self.client = self.app.test_client()

    @staticmethod
    def headers(token):
        return {"Authorization": f"Bearer {token}"}

    @patch("app.blueprints.category.routes.CategoryService.get_all_categories")
    def test_list_returns_active_book_counts(self, get_categories):
        get_categories.return_value = [
            {"id": "category-1", "name": "Programming", "book_count": 3},
            {"id": "category-2", "name": "History", "book_count": 0},
        ]

        response = self.client.get(
            "/api/categories", headers=self.headers(self.librarian_token)
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()[0]["book_count"], 3)
        self.assertEqual(response.get_json()[1]["book_count"], 0)

    @patch("app.blueprints.category.routes.CategoryService.create_category")
    def test_librarian_cannot_create_category(self, create_category):
        response = self.client.post(
            "/api/categories",
            json={"name": "Science"},
            headers=self.headers(self.librarian_token),
        )

        self.assertEqual(response.status_code, 403)
        create_category.assert_not_called()

    @patch("app.blueprints.category.routes.CategoryService.update_category")
    @patch("app.blueprints.category.routes.CategoryService.delete_category")
    def test_librarian_cannot_update_or_delete_category(self, delete_category, update_category):
        category_id = uuid.uuid4()

        update_response = self.client.put(
            f"/api/categories/{category_id}",
            json={"name": "Science"},
            headers=self.headers(self.librarian_token),
        )
        delete_response = self.client.delete(
            f"/api/categories/{category_id}",
            headers=self.headers(self.librarian_token),
        )

        self.assertEqual(update_response.status_code, 403)
        self.assertEqual(delete_response.status_code, 403)
        update_category.assert_not_called()
        delete_category.assert_not_called()


if __name__ == "__main__":
    unittest.main()
