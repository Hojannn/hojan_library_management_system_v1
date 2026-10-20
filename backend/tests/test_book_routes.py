import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app.blueprints.books.routes import books_bp


class FakeBook:
    def __init__(self, book_id=None, deleted=False):
        self.book_id = str(book_id or uuid.uuid4())
        self.deleted = deleted

    def to_dict(self):
        return {
            "id": self.book_id,
            "title": "Clean Code",
            "is_deleted": self.deleted,
            "archived_at": "2026-10-20T00:00:00+00:00" if self.deleted else None,
        }


class BookRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, JWT_SECRET_KEY="test-secret")
        JWTManager(self.app)
        self.app.register_blueprint(books_bp)
        with self.app.app_context():
            self.staff_token = create_access_token(
                identity=str(uuid.uuid4()), additional_claims={"role": "librarian"}
            )
            self.student_token = create_access_token(
                identity=str(uuid.uuid4()), additional_claims={"role": "student"}
            )
        self.client = self.app.test_client()
        self.book_id = uuid.uuid4()

    @staticmethod
    def headers(token):
        return {"Authorization": f"Bearer {token}"}

    @patch("app.blueprints.books.routes.BookService.get_staff_catalog")
    def test_staff_catalog_defaults_to_active_and_supports_archived(self, catalog):
        catalog.return_value = [FakeBook(deleted=False)]
        response = self.client.get(
            "/api/books/admin/catalog", headers=self.headers(self.staff_token)
        )
        self.assertEqual(response.status_code, 200)
        catalog.assert_called_once_with("active")

        catalog.reset_mock()
        catalog.return_value = [FakeBook(deleted=True)]
        response = self.client.get(
            "/api/books/admin/catalog?state=archived",
            headers=self.headers(self.staff_token),
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["books"][0]["is_deleted"])
        catalog.assert_called_once_with("archived")

    def test_staff_catalog_requires_staff_role(self):
        unauthenticated = self.client.get("/api/books/admin/catalog")
        student = self.client.get(
            "/api/books/admin/catalog", headers=self.headers(self.student_token)
        )
        self.assertEqual(unauthenticated.status_code, 401)
        self.assertEqual(student.status_code, 403)

    @patch("app.blueprints.books.routes.BookService.get_staff_catalog")
    def test_invalid_catalog_state_returns_400(self, catalog):
        catalog.side_effect = ValueError("Invalid catalog state")
        response = self.client.get(
            "/api/books/admin/catalog?state=deleted",
            headers=self.headers(self.staff_token),
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"message": "Invalid catalog state"})

    @patch("app.blueprints.books.routes.BookService.archive_book")
    def test_archive_returns_book_and_maps_errors(self, archive):
        archive.return_value = FakeBook(self.book_id, deleted=True)
        response = self.client.delete(
            f"/api/books/{self.book_id}", headers=self.headers(self.staff_token)
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["book"]["is_deleted"])

        archive.side_effect = ValueError("Cannot archive book with active circulation")
        response = self.client.delete(
            f"/api/books/{self.book_id}", headers=self.headers(self.staff_token)
        )
        self.assertEqual(response.status_code, 400)

        archive.side_effect = LookupError("Book not found")
        response = self.client.delete(
            f"/api/books/{self.book_id}", headers=self.headers(self.staff_token)
        )
        self.assertEqual(response.status_code, 404)

    @patch("app.blueprints.books.routes.BookService.restore_book")
    def test_restore_returns_book_and_maps_wrong_state(self, restore):
        restore.return_value = FakeBook(self.book_id, deleted=False)
        response = self.client.put(
            f"/api/books/restore/{self.book_id}", headers=self.headers(self.staff_token)
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()["book"]["is_deleted"])

        restore.side_effect = LookupError("Book not found")
        response = self.client.put(
            f"/api/books/restore/{self.book_id}", headers=self.headers(self.staff_token)
        )
        self.assertEqual(response.status_code, 404)

    @patch("app.blueprints.books.routes.BookService.get_paginated_books")
    def test_public_catalog_keeps_using_active_only_query(self, get_books):
        get_books.return_value = SimpleNamespace(
            items=[FakeBook(deleted=False)],
            total=1,
            pages=1,
            page=1,
            per_page=10,
            has_next=False,
            has_prev=False,
        )
        response = self.client.get("/api/books")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()["books"][0]["is_deleted"])
        get_books.assert_called_once_with(
            search_query="", category_id=None, page=1, limit=10
        )


if __name__ == "__main__":
    unittest.main()
