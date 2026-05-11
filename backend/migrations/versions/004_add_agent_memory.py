"""add agent_memory table and agent_mode column on query_log

Revision ID: 004_add_agent_memory
Revises: 003_downtime_enrichment_not_null
Create Date: 2026-05-11
"""
from alembic import op
import sqlalchemy as sa


revision = "004_add_agent_memory"
down_revision = "003_downtime_enrichment_not_null"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agent_memory",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_question", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("last_used_at", sa.DateTime(timezone=True)),
        sa.CheckConstraint(
            "kind IN ('insight','preference','recipe','glossary')",
            name="ck_agent_memory_kind",
        ),
    )
    op.create_index("ix_agent_memory_kind", "agent_memory", ["kind"])

    op.add_column("query_log", sa.Column("agent_mode", sa.String(length=16)))


def downgrade() -> None:
    op.drop_column("query_log", "agent_mode")
    op.drop_index("ix_agent_memory_kind", table_name="agent_memory")
    op.drop_table("agent_memory")
