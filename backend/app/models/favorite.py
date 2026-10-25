from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseEntity
from app.models.schemas import FavoriteDict
from app.extensions import db


class Favorite(BaseEntity):
    __tablename__ = "favorites"
    __table_args__ = (
        db.UniqueConstraint("user_id", "book_id", name="uq_favorites_user_book"),
    )

    user_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False, index=True
    )
    book_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey("books.id"), nullable=False, index=True
    )
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    user = db.relationship("User", backref=db.backref("favorites", cascade="all, delete-orphan"))
    book = db.relationship("Book", backref=db.backref("favorites", cascade="all, delete-orphan"))

    def __init__(self, user_id, book_id):
        self.user_id = user_id
        self.book_id = book_id

    def to_dict(self) -> FavoriteDict:
        return {
            "id": str(self.id) if self.id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "book_id": str(self.book_id) if self.book_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
