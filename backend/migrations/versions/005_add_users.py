"""add users, permissions, user_permissions tables

Revision ID: 005_add_users
Revises: 004_add_agent_memory
Create Date: 2026-05-13

Migration 001 set `ALTER DEFAULT PRIVILEGES … GRANT SELECT … TO factory_ro`,
so any new table is automatically readable by the read-only role used by the
LLM SQL agent. That would leak password_hash. We explicitly REVOKE SELECT
on all three tables after creation.
"""
from alembic import op
import sqlalchemy as sa


revision = "005_add_users"
down_revision = "004_add_agent_memory"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("username", sa.Text(), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "permissions",
        sa.Column("name", sa.Text(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "user_permissions",
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("permission_name", sa.Text(), sa.ForeignKey("permissions.name", ondelete="CASCADE"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_user_permissions_user_id", "user_permissions", ["user_id"])
    op.create_index("ix_user_permissions_permission_name", "user_permissions", ["permission_name"])

    # The factory_ro role inherited SELECT via ALTER DEFAULT PRIVILEGES; revoke
    # it so password hashes are never visible to the agent's SQL tool.
    op.execute("REVOKE SELECT ON users FROM factory_ro")
    op.execute("REVOKE SELECT ON permissions FROM factory_ro")
    op.execute("REVOKE SELECT ON user_permissions FROM factory_ro")


def downgrade() -> None:
    op.drop_index("ix_user_permissions_permission_name", table_name="user_permissions")
    op.drop_index("ix_user_permissions_user_id", table_name="user_permissions")
    op.drop_table("user_permissions")
    op.drop_table("permissions")
    op.drop_table("users")
