"""set NOT NULL on embedding and category for all three downtime tables

Run AFTER scripts/enrich_downtimes.py has populated all rows. The upgrade()
fails loudly if any row is still NULL — so the order is enforced.

Revision ID: 003_downtime_enrichment_not_null
Revises: 002_add_downtime_enrichment
Create Date: 2026-05-11
"""
from alembic import op
from sqlalchemy import text


revision = "003_downtime_enrichment_not_null"
down_revision = "002_add_downtime_enrichment"
branch_labels = None
depends_on = None


DOWNTIME_TABLES = ("factory_downtimes", "input_feed_downtimes", "filter_press_downtimes")


def upgrade() -> None:
    bind = op.get_bind()
    pending: list[tuple[str, int]] = []
    for t in DOWNTIME_TABLES:
        nulls = bind.execute(
            text(f"SELECT COUNT(*) FROM {t} WHERE embedding IS NULL OR category IS NULL")
        ).scalar() or 0
        if nulls > 0:
            pending.append((t, nulls))

    if pending:
        details = ", ".join(f"{t}={n}" for t, n in pending)
        raise RuntimeError(
            "Cannot apply migration 003: some rows still have NULL embedding or "
            f"category ({details}). Run scripts/enrich_downtimes.py first."
        )

    for t in DOWNTIME_TABLES:
        op.execute(f"ALTER TABLE {t} ALTER COLUMN embedding SET NOT NULL")
        op.execute(f"ALTER TABLE {t} ALTER COLUMN category SET NOT NULL")


def downgrade() -> None:
    for t in DOWNTIME_TABLES:
        op.execute(f"ALTER TABLE {t} ALTER COLUMN embedding DROP NOT NULL")
        op.execute(f"ALTER TABLE {t} ALTER COLUMN category DROP NOT NULL")
