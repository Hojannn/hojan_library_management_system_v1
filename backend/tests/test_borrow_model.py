import unittest
import uuid
from datetime import datetime

from app.models.book import Book
from app.models.borrow import Borrow
from app.models.user import User


class BorrowModelSerializationTests(unittest.TestCase):
    def test_ready_for_pickup_fields_are_serialized(self):
        user = User("Ana Cruz", "ana@example.com")
        user.id = uuid.uuid4()
        book = Book("Clean Code", "Robert C. Martin", total_copies=3, available_copies=2)
        book.id = uuid.uuid4()
        borrow = Borrow(user.id, book.id, status="READY_FOR_PICKUP")
        borrow.id = uuid.uuid4()
        borrow.user = user
        borrow.book = book
        # PostgreSQL commonly returns DateTime columns as naive values. The
        # API contract must still identify them as UTC for browser-local dates.
        borrow.approved_at = datetime(2026, 10, 20, 4, 30)
        borrow.rejection_reason = None

        result = borrow.to_dict()

        self.assertEqual(result["status"], "READY_FOR_PICKUP")
        self.assertEqual(result["approved_at"], "2026-10-20T04:30:00+00:00")
        self.assertEqual(result["book_available_copies"], 2)
        self.assertIsNone(result["rejection_reason"])

    def test_optional_workflow_fields_have_safe_fallbacks(self):
        borrow = Borrow(uuid.uuid4(), uuid.uuid4())

        result = borrow.to_dict()

        self.assertIsNone(result["approved_at"])
        self.assertIsNone(result["rejection_reason"])
        self.assertIsNone(result["book_available_copies"])


if __name__ == "__main__":
    unittest.main()
