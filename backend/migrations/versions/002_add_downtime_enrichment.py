"""add enrichment columns to the three downtime tables

Adds the columns nullable so the backfill script (scripts/enrich_downtimes.py)
can populate them. Migration 003 then sets NOT NULL on embedding + category.

Revision ID: 002_add_downtime_enrichment
Revises: 001_initial
Create Date: 2026-05-11
"""
from alembic import op


revision = "002_add_downtime_enrichment"
down_revision = "001_initial"
branch_labels = None
depends_on = None


DOWNTIME_TABLES = ("factory_downtimes", "input_feed_downtimes", "filter_press_downtimes")


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    for t in DOWNTIME_TABLES:
        op.execute(f"ALTER TABLE {t} ADD COLUMN embedding vector(1024)")
        op.execute(f"ALTER TABLE {t} ADD COLUMN category text")
        op.execute(f"ALTER TABLE {t} ADD COLUMN department_tag text")
        op.execute(f"ALTER TABLE {t} ADD COLUMN equipment_codes text[]")
        op.execute(f"ALTER TABLE {t} ADD COLUMN start_time time")
        op.execute(f"ALTER TABLE {t} ADD COLUMN end_time time")
        op.execute(f"ALTER TABLE {t} ADD COLUMN is_planned boolean NOT NULL DEFAULT false")


def downgrade() -> None:
    for t in DOWNTIME_TABLES:
        for col in ("is_planned", "end_time", "start_time", "equipment_codes",
                    "department_tag", "category", "embedding"):
            op.execute(f"ALTER TABLE {t} DROP COLUMN IF EXISTS {col}")
