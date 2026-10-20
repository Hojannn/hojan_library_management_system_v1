import unittest
from datetime import datetime, timezone

from app.models.book import Book


class BookModelSerializationTests(unittest.TestCase):
    def test_active_book_serializes_archive_fields(self):
        book = Book("Clean Code", "Robert C. Martin")

        result = book.to_dict()

        self.assertIs(result["is_deleted"], False)
        self.assertIsNone(result["archived_at"])

    def test_archived_book_serializes_utc_timestamp(self):
        book = Book("Clean Code", "Robert C. Martin")
        book.is_deleted = True
        book.archived_at = datetime(2026, 10, 20, 9, 30, tzinfo=timezone.utc)

        result = book.to_dict()

        self.assertIs(result["is_deleted"], True)
        self.assertEqual(result["archived_at"], "2026-10-20T09:30:00+00:00")


if __name__ == "__main__":
    unittest.main()
