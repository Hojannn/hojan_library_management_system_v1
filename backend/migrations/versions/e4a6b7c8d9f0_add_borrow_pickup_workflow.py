"""Add borrow pickup workflow fields

Revision ID: e4a6b7c8d9f0
Revises: b7f3a91c4d2e
Create Date: 2026-10-20
"""
from alembic import op
import sqlalchemy as sa


revision = "e4a6b7c8d9f0"
down_revision = "b7f3a91c4d2e"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("borrows", sa.Column("approved_at", sa.DateTime(), nullable=True))
    op.add_column("borrows", sa.Column("rejection_reason", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("borrows", "rejection_reason")
    op.drop_column("borrows", "approved_at")
