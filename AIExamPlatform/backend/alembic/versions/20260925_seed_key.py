"""Add stable identities for default question seeding.

Revision ID: 20260925_seed_key
Revises: 20260925_question_bank
"""

from alembic import op
import sqlalchemy as sa

revision = "20260925_seed_key"
down_revision = "20260925_question_bank"
branch_labels = None
depends_on = None


def upgrade():
    inspector = sa.inspect(op.get_bind())
    if "seed_key" not in {column["name"] for column in inspector.get_columns("question_bank")}:
        op.add_column("question_bank", sa.Column("seed_key", sa.String(length=80), nullable=True))


def downgrade():
    op.drop_column("question_bank", "seed_key")
