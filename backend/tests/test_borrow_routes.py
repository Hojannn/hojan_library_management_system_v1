import unittest
import uuid
from unittest.mock import patch

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app.blueprints.borrows.routes import borrows_bp


class FakeBorrow:
    def __init__(self, status):
        self.status = status

    def to_dict(self):
        return {"id": "borrow-1", "status": self.status}


class BorrowRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, JWT_SECRET_KEY="test-secret")
        JWTManager(self.app)
        self.app.register_blueprint(borrows_bp)
        with self.app.app_context():
            self.staff_token = create_access_token(
                identity=str(uuid.uuid4()), additional_claims={"role": "librarian"}
            )
            self.student_token = create_access_token(
                identity=str(uuid.uuid4()), additional_claims={"role": "student"}
            )
        self.client = self.app.test_client()
        self.borrow_id = uuid.uuid4()

    def headers(self, token=None):
        return {"Authorization": f"Bearer {token or self.staff_token}"}

    @patch("app.blueprints.borrows.routes.BorrowService.confirm_borrow_pickup")
    def test_confirm_pickup_returns_updated_borrow(self, confirm):
        confirm.return_value = FakeBorrow("BORROWED")

        response = self.client.put(
            f"/api/borrows/admin/{self.borrow_id}/confirm-pickup",
            headers=self.headers(),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["borrow"]["status"], "BORROWED")

    @patch("app.blueprints.borrows.routes.BorrowService.reject_borrow_request")
    def test_reject_passes_trimmed_reason(self, reject):
        reject.return_value = FakeBorrow("REJECTED")

        response = self.client.put(
            f"/api/borrows/admin/{self.borrow_id}/reject-borrow",
            json={"reason": "  Missing ID  "},
            headers=self.headers(),
        )

        self.assertEqual(response.status_code, 200)
        reject.assert_called_once_with(self.borrow_id, "Missing ID")

    @patch("app.blueprints.borrows.routes.BorrowService.reject_borrow_request")
    def test_reject_requires_non_empty_json_reason(self, reject):
        for payload in (None, {}, {"reason": ""}, {"reason": "   "}):
            with self.subTest(payload=payload):
                kwargs = {} if payload is None else {"json": payload}
                response = self.client.put(
                    f"/api/borrows/admin/{self.borrow_id}/reject-borrow",
                    headers=self.headers(),
                    **kwargs,
                )
                self.assertEqual(response.status_code, 400)
                self.assertIsInstance(response.get_json()["message"], str)
        reject.assert_not_called()

    def test_pickup_requires_staff_role(self):
        response = self.client.put(
            f"/api/borrows/admin/{self.borrow_id}/confirm-pickup",
            headers=self.headers(self.student_token),
        )
        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
