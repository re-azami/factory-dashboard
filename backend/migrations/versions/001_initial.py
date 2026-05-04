"""Initial tables: daily_report, production_shift (wide), downtime, raw_sheet_cells, query_log + read-only role + pgvector.

Revision ID: 001
Create Date: 2026-05-02
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # ── 1. daily_report ───────────────────────────────────────────────────────
    op.create_table(
        "daily_report",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("report_date", sa.Date, nullable=False, unique=True, index=True),
        sa.Column("jalali_date", sa.String(20), nullable=False),
        sa.Column("sheet_name", sa.String(50), nullable=False),
        sa.Column("source_file", sa.Text, nullable=False),
        sa.Column("batch_code", sa.Text),
        sa.Column("supervisors", sa.Text),
        sa.Column("ingested_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── 2. production_shift (wide) ────────────────────────────────────────────
    op.create_table(
        "production_shift",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("report_date", sa.Date, nullable=False, index=True),
        sa.Column("jalali_date", sa.String(20), nullable=False),
        sa.Column("shift", sa.String(10), nullable=False),
        sa.Column("line", sa.Integer),
        sa.Column("source_file", sa.Text, nullable=False),

        # Production: daily
        sa.Column("daily_feed_tonnage", sa.Float),
        sa.Column("daily_concentrate_tonnage", sa.Float),
        sa.Column("daily_recovery_percent", sa.Float),
        sa.Column("ore_grade_code", sa.String(50)),

        # Production: monthly
        sa.Column("monthly_feed_tonnage", sa.Float),
        sa.Column("monthly_concentrate_tonnage", sa.Float),
        sa.Column("monthly_recovery_percent", sa.Float),

        # Production: yearly
        sa.Column("yearly_feed_tonnage", sa.Float),
        sa.Column("yearly_concentrate_tonnage", sa.Float),
        sa.Column("yearly_recovery_percent", sa.Float),

        # Throughput
        sa.Column("throughput_ton_per_hour", sa.Float),

        # Equipment hours
        sa.Column("factory_operation_hours", sa.Float),
        sa.Column("factory_downtime_hours", sa.Float),
        sa.Column("feed_input_operation_hours", sa.Float),
        sa.Column("feed_input_downtime_hours", sa.Float),
        sa.Column("drum_filter_1_hours", sa.Float),
        sa.Column("drum_filter_2_hours", sa.Float),
        sa.Column("filter_press_operation_hours", sa.Float),
        sa.Column("filter_press_downtime_hours", sa.Float),

        # Consumption
        sa.Column("flocculant_grams", sa.Float),
        sa.Column("flocculant_type", sa.String(50)),
        sa.Column("water_consumption_m3", sa.Float),
        sa.Column("ball_mill_primary_kg", sa.Float),
        sa.Column("ball_mill_secondary_kg", sa.Float),

        # Quality: feed
        sa.Column("feed_fe_percent", sa.Float),
        sa.Column("feed_feo_percent", sa.Float),
        sa.Column("feed_moisture_percent", sa.Float),
        sa.Column("feed_k80_microns", sa.Float),

        # Quality: concentrate
        sa.Column("concentrate_fe_percent", sa.Float),
        sa.Column("concentrate_feo_percent", sa.Float),
        sa.Column("concentrate_moisture_percent", sa.Float),
        sa.Column("concentrate_k80_microns", sa.Float),

        # Quality: tailings
        sa.Column("tailings_fe_percent", sa.Float),
        sa.Column("tailings_feo_percent", sa.Float),
        sa.Column("tailings_k80_microns", sa.Float),

        # Quality: intermediate streams
        sa.Column("primary_mill_output", sa.Float),
        sa.Column("secondary_mill_output", sa.Float),
        sa.Column("hydrocyclone_1_overflow", sa.Float),
        sa.Column("hydrocyclone_2_overflow", sa.Float),
        sa.Column("primary_mill_output_fe_percent", sa.Float),
        sa.Column("primary_mill_output_feo_percent", sa.Float),

        # Quality: derived
        sa.Column("dry_weight_recovery_percent", sa.Float),
        sa.Column("assay_recovery_percent", sa.Float),
        sa.Column("separation_efficiency_percent", sa.Float),
        sa.Column("filter_cake_moisture_percent", sa.Float),

        sa.UniqueConstraint("report_date", "shift", "line", name="uq_shift_date_shift_line"),
    )

    # ── 3. downtime ───────────────────────────────────────────────────────────
    op.create_table(
        "downtime",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("report_date", sa.Date, nullable=False, index=True),
        sa.Column("jalali_date", sa.String(20), nullable=False),
        sa.Column("section", sa.String(20), nullable=False, index=True),
        sa.Column("shift", sa.String(10)),
        sa.Column("line", sa.Integer),
        sa.Column("raw_text", sa.Text, nullable=False),
        sa.Column("duration_minutes", sa.Integer),
        sa.Column("equipment_code", sa.String(50)),
        sa.Column("fault_category", sa.String(50)),
        sa.Column("start_time", sa.String(10)),
        sa.Column("end_time", sa.String(10)),
        sa.Column("source_file", sa.Text, nullable=False),
    )

    # ── 4. raw_sheet_cells ────────────────────────────────────────────────────
    op.create_table(
        "raw_sheet_cells",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("report_date", sa.Date, nullable=False, index=True),
        sa.Column("sheet_name", sa.String(50), nullable=False),
        sa.Column("source_file", sa.Text, nullable=False),
        sa.Column("cells", sa.JSON, nullable=False),
    )

    # ── 5. query_log ──────────────────────────────────────────────────────────
    op.create_table(
        "query_log",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("asked_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("tool_calls", sa.JSON),
        sa.Column("answer", sa.Text),
        sa.Column("llm_provider", sa.String(30)),
    )

    # ── Read-only role for the agent SQL tool ─────────────────────────────────
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'factory_ro') THEN
                CREATE ROLE factory_ro LOGIN PASSWORD 'factory_ro';
            END IF;
        END $$
    """)
    op.execute("GRANT CONNECT ON DATABASE factory TO factory_ro")
    op.execute("GRANT USAGE ON SCHEMA public TO factory_ro")
    op.execute("GRANT SELECT ON ALL TABLES IN SCHEMA public TO factory_ro")
    op.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO factory_ro")


def downgrade() -> None:
    op.drop_table("query_log")
    op.drop_table("raw_sheet_cells")
    op.drop_table("downtime")
    op.drop_table("production_shift")
    op.drop_table("daily_report")
