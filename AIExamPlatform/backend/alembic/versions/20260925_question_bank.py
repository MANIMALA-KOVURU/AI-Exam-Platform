"""Extend question bank for CRUD, typed answers, and attachments.

Revision ID: 20260925_question_bank
Revises:
"""

from alembic import op
import sqlalchemy as sa

revision = "20260925_question_bank"
down_revision = None
branch_labels = None
depends_on = None


def _has_column(inspector, table_name, column_name):
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    question_columns = {
        "seed_key": sa.Column("seed_key", sa.String(length=80), nullable=True),
        "expected_answer": sa.Column("expected_answer", sa.Text(), nullable=True),
        "evaluation_criteria": sa.Column("evaluation_criteria", sa.Text(), nullable=True),
        "explanation": sa.Column("explanation", sa.Text(), nullable=True),
    }
    for name, column in question_columns.items():
        if not _has_column(inspector, "question_bank", name):
            op.add_column("question_bank", column)

    if not _has_column(inspector, "question_options", "option_key"):
        op.add_column("question_options", sa.Column("option_key", sa.String(length=1), nullable=True))
        bind.execute(sa.text("UPDATE question_options SET option_key = 'A' WHERE option_key IS NULL"))

    if "question_attachments" not in inspector.get_table_names():
        op.create_table(
            "question_attachments",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("question_id", sa.String(length=36), sa.ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=True),
            sa.Column("file_name", sa.String(length=255), nullable=False),
            sa.Column("stored_name", sa.String(length=255), nullable=False, unique=True),
            sa.Column("file_type", sa.String(length=80), nullable=False),
            sa.Column("file_url", sa.String(length=500), nullable=False),
            sa.Column("file_size", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )


def downgrade():
    op.drop_table("question_attachments")
    op.drop_column("question_options", "option_key")
    op.drop_column("question_bank", "explanation")
    op.drop_column("question_bank", "evaluation_criteria")
    op.drop_column("question_bank", "expected_answer")
    op.drop_column("question_bank", "seed_key")
