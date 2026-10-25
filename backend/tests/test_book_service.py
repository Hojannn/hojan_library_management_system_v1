import unittest
from datetime import datetime, timedelta, timezone

from flask import Flask
from werkzeug.datastructures import MultiDict

from app.extensions import db
from app.models import Book, Borrow, User
from app.services.book_service import BookService


class BookServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(
            TESTING=True,
            SQLALCHEMY_DATABASE_URI="sqlite://",
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
        )
        db.init_app(self.app)
        self.context = self.app.app_context()
        self.context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()


class BookCatalogServiceTests(BookServiceTestCase):
    def test_public_catalog_excludes_archived_books(self):
        active = Book("Active", "Author")
        archived = Book("Archived", "Author")
        archived.is_deleted = True
        archived.archived_at = datetime.now(timezone.utc)
        db.session.add_all([active, archived])
        db.session.commit()

        result = BookService.get_paginated_books(limit=10)

        self.assertEqual([book.title for book in result.items], ["Active"])

    def test_catalog_filters_and_orders_each_state(self):
        older = Book("Older", "Author")
        newer = Book("Newer", "Author")
        archived_old = Book("Archived old", "Author")
        archived_new = Book("Archived new", "Author")
        older.created_at = datetime(2026, 1, 1)
        newer.created_at = datetime(2026, 2, 1)
        archived_old.is_deleted = archived_new.is_deleted = True
        archived_old.archived_at = datetime(2026, 3, 1, tzinfo=timezone.utc)
        archived_new.archived_at = datetime(2026, 4, 1, tzinfo=timezone.utc)
        db.session.add_all([older, newer, archived_old, archived_new])
        db.session.commit()

        self.assertEqual(
            [book.title for book in BookService.get_staff_catalog("active")],
            ["Newer", "Older"],
        )
        self.assertEqual(
            [book.title for book in BookService.get_staff_catalog("archived")],
            ["Archived new", "Archived old"],
        )

    def test_catalog_rejects_invalid_states(self):
        for state in ("", "Active", "deleted"):
            with self.subTest(state=state):
                with self.assertRaisesRegex(ValueError, "Invalid catalog state"):
                    BookService.get_staff_catalog(state)


class BookArchiveServiceTests(BookServiceTestCase):
    def setUp(self):
        super().setUp()
        self.user = User("Ana Cruz", "ana@example.com")
        self.book = Book("Clean Code", "Robert C. Martin", total_copies=2)
        db.session.add_all([self.user, self.book])
        db.session.commit()

    def add_borrow(self, status):
        borrow = Borrow(self.user.id, self.book.id, status=status)
        db.session.add(borrow)
        db.session.commit()
        return borrow

    def test_every_active_circulation_status_blocks_archive(self):
        blocking = (
            Borrow.STATUS_PENDING_BORROW,
            Borrow.STATUS_READY_FOR_PICKUP,
            Borrow.STATUS_BORROWED,
            Borrow.STATUS_OVERDUE,
            Borrow.STATUS_PENDING_RETURN,
        )
        for status in blocking:
            with self.subTest(status=status):
                borrow = self.add_borrow(status)
                with self.assertRaisesRegex(ValueError, "active circulation"):
                    BookService.archive_book(self.book.id)
                self.assertFalse(self.book.is_deleted)
                self.assertIsNone(self.book.archived_at)
                db.session.delete(borrow)
                db.session.commit()

    def test_returned_and_rejected_records_do_not_block_archive(self):
        for status in (Borrow.STATUS_RETURNED, Borrow.STATUS_REJECTED):
            self.add_borrow(status)

        result = BookService.archive_book(self.book.id)

        self.assertTrue(result.is_deleted)
        self.assertIsNotNone(result.archived_at)

    def test_restore_clears_both_archive_fields(self):
        self.book.is_deleted = True
        self.book.archived_at = datetime.now(timezone.utc) - timedelta(days=1)
        db.session.commit()

        result = BookService.restore_book(self.book.id)

        self.assertFalse(result.is_deleted)
        self.assertIsNone(result.archived_at)

    def test_archive_and_restore_retries_preserve_state(self):
        archived = BookService.archive_book(self.book.id)
        archived_at = archived.archived_at
        with self.assertRaisesRegex(LookupError, "Book not found"):
            BookService.archive_book(self.book.id)
        self.assertEqual(self.book.archived_at, archived_at)

        BookService.restore_book(self.book.id)
        with self.assertRaisesRegex(LookupError, "Book not found"):
            BookService.restore_book(self.book.id)
        self.assertFalse(self.book.is_deleted)
        self.assertIsNone(self.book.archived_at)

    def test_total_copies_cannot_drop_below_on_loan_count(self):
        self.book._available_copies = 0
        db.session.commit()

        with self.assertRaisesRegex(ValueError, "currently borrowed"):
            BookService.update_book(
                self.book.id,
                MultiDict({"total_copies": "1"}),
            )

        db.session.refresh(self.book)
        self.assertEqual(self.book.total_copies, 2)
        self.assertEqual(self.book.available_copies, 0)


class BookFavoriteServiceTests(BookServiceTestCase):
    def setUp(self):
        super().setUp()
        self.user = User("Ana Cruz", "ana@example.com")
        self.book1 = Book("Clean Code", "Robert C. Martin")
        self.book2 = Book("Refactoring", "Martin Fowler")
        self.archived = Book("Archived Book", "Author")
        self.archived.is_deleted = True
        db.session.add_all([self.user, self.book1, self.book2, self.archived])
        db.session.commit()

    def test_add_get_and_remove_favorites(self):
        fav1 = BookService.add_favorite(str(self.user.id), str(self.book1.id))
        fav1_dup = BookService.add_favorite(self.user.id, self.book1.id)
        self.assertEqual(fav1.id, fav1_dup.id)

        BookService.add_favorite(self.user.id, self.book2.id)
        favorites = BookService.get_user_favorites(str(self.user.id))
        self.assertEqual(len(favorites), 2)
        self.assertEqual({b.title for b in favorites}, {"Clean Code", "Refactoring"})

        removed = BookService.remove_favorite(str(self.user.id), str(self.book1.id))
        self.assertTrue(removed)
        self.assertFalse(BookService.remove_favorite(self.user.id, self.book1.id))
        self.assertEqual(
            [b.title for b in BookService.get_user_favorites(self.user.id)],
            ["Refactoring"],
        )

    def test_cannot_favorite_missing_or_archived_book(self):
        with self.assertRaisesRegex(LookupError, "Book not found"):
            BookService.add_favorite(self.user.id, self.archived.id)


if __name__ == "__main__":
    unittest.main()
