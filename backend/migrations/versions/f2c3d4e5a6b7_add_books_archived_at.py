"""Add book archive timestamp

Revision ID: f2c3d4e5a6b7
Revises: e4a6b7c8d9f0
Create Date: 2026-10-20
"""
from alembic import op
import sqlalchemy as sa


revision = "f2c3d4e5a6b7"
down_revision = "e4a6b7c8d9f0"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "books",
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        sa.text(
            "UPDATE books SET archived_at = CURRENT_TIMESTAMP "
            "WHERE is_deleted = TRUE AND archived_at IS NULL"
        )
    )


def downgrade():
    op.drop_column("books", "archived_at")
