"""initial schema: supervisors, shifts, loads, line_shift_reports, 3 downtime tables, query_log

Revision ID: 001_initial
Revises:
Create Date: 2026-05-09
"""
from alembic import op
import sqlalchemy as sa


revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


DOMAIN_TABLES = (
    "supervisors",
    "shifts",
    "loads",
    "line_shift_reports",
    "factory_downtimes",
    "input_feed_downtimes",
    "filter_press_downtimes",
)


def upgrade() -> None:
    # ── Read-only role for the agent SQL tool ─────────────────────────────────
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'factory_ro') THEN
                CREATE ROLE factory_ro LOGIN PASSWORD 'factory_ro';
            END IF;
        END
        $$
    """)
    op.execute("GRANT CONNECT ON DATABASE factory TO factory_ro")
    op.execute("GRANT USAGE ON SCHEMA public TO factory_ro")

    # ── Shared updated_at trigger function ────────────────────────────────────
    op.execute("""
        CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # ── 1. supervisors ────────────────────────────────────────────────────────
    op.create_table(
        "supervisors",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ── 2. shifts ─────────────────────────────────────────────────────────────
    op.create_table(
        "shifts",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("shift", sa.String(8), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("jalali_date", sa.Text(), nullable=False),
        sa.Column("supervisor_id", sa.BigInteger(), sa.ForeignKey("supervisors.id", ondelete="RESTRICT")),
        sa.Column("water_consumption", sa.Float()),
        sa.Column("downtime_description", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("shift IN ('day','night')", name="ck_shifts_shift"),
        sa.UniqueConstraint("date", "shift", name="uq_shifts_date_shift"),
    )
    op.create_index("ix_shifts_date", "shifts", ["date"])
    op.create_index("ix_shifts_supervisor_id", "shifts", ["supervisor_id"])

    # ── 3. loads ──────────────────────────────────────────────────────────────
    op.create_table(
        "loads",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("code", sa.Text(), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ── 4. line_shift_reports ─────────────────────────────────────────────────
    op.create_table(
        "line_shift_reports",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("shift_id", sa.BigInteger(), sa.ForeignKey("shifts.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("load_id", sa.BigInteger(), sa.ForeignKey("loads.id", ondelete="RESTRICT")),
        sa.Column("line_number", sa.SmallInteger(), nullable=False),
        sa.Column("load_segment", sa.SmallInteger(), nullable=False, server_default="1"),

        sa.Column("input_feed_tonnage", sa.Integer()),
        sa.Column("production_tonnage", sa.Integer()),
        sa.Column("recovery", sa.Float()),

        sa.Column("operation_hour", sa.Float()),
        sa.Column("downtime_hour", sa.Float()),
        sa.Column("ton_per_hour", sa.Float()),
        sa.Column("drum_filter_1_hour", sa.Float()),
        sa.Column("drum_filter_2_hour", sa.Float()),
        sa.Column("filter_press_operation_hour", sa.Float()),
        sa.Column("filter_press_downtime_hour", sa.Float()),

        sa.Column("flocculant_consumption_grams", sa.Integer()),
        sa.Column("flocculant_type", sa.Text()),

        sa.Column("primary_mill_30", sa.Integer()),
        sa.Column("primary_mill_40", sa.Integer()),
        sa.Column("primary_mill_50", sa.Integer()),
        sa.Column("primary_mill_60", sa.Integer()),
        sa.Column("secondary_mill_25", sa.Integer()),
        sa.Column("secondary_mill_30", sa.Integer()),
        sa.Column("secondary_mill_40", sa.Integer()),
        sa.Column("secondary_mill_50", sa.Integer()),

        sa.Column("fe_input_feed", sa.Float()),
        sa.Column("feo_input_feed", sa.Float()),
        sa.Column("fe_concentrate", sa.Float()),
        sa.Column("feo_concentrate", sa.Float()),
        sa.Column("fe_thickener_tailing", sa.Float()),
        sa.Column("feo_thickener_tailing", sa.Float()),
        sa.Column("fe_first_ballmill_output", sa.Float()),
        sa.Column("feo_first_ballmill_output", sa.Float()),

        sa.Column("k80_size_input_feed", sa.Integer()),
        sa.Column("k80_size_primary_ballmill", sa.Integer()),
        sa.Column("k80_size_secondary_ballmill", sa.Integer()),
        sa.Column("k80_size_hydrocyclone_overflow_1", sa.Integer()),
        sa.Column("k80_size_hydrocyclone_overflow_2", sa.Integer()),
        sa.Column("k80_size_tailing", sa.Integer()),
        sa.Column("k80_size_concentrate", sa.Integer()),

        sa.Column("dry_weight_recovery", sa.Float()),
        sa.Column("metallurgical_recovery", sa.Float()),
        sa.Column("separation_efficiency", sa.Float()),

        sa.Column("input_feed_moisture", sa.Float()),
        sa.Column("concentrate_moisture", sa.Float()),
        sa.Column("filter_press_cake_moisture", sa.Float()),

        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),

        sa.CheckConstraint("line_number IN (1,2)", name="ck_lsr_line_number"),
        sa.CheckConstraint("load_segment IN (1,2)", name="ck_lsr_load_segment"),
        sa.UniqueConstraint("shift_id", "line_number", "load_segment", name="uq_lsr_shift_line_segment"),
    )
    op.create_index("ix_lsr_shift_id", "line_shift_reports", ["shift_id"])
    op.create_index("ix_lsr_load_id", "line_shift_reports", ["load_id"])

    # ── 5. factory_downtimes ──────────────────────────────────────────────────
    op.create_table(
        "factory_downtimes",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("line_shift_report_id", sa.BigInteger(),
                  sa.ForeignKey("line_shift_reports.id", ondelete="CASCADE"), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("duration", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_factory_downtimes_lsr", "factory_downtimes", ["line_shift_report_id"])

    # ── 6. input_feed_downtimes ───────────────────────────────────────────────
    op.create_table(
        "input_feed_downtimes",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("line_shift_report_id", sa.BigInteger(),
                  sa.ForeignKey("line_shift_reports.id", ondelete="CASCADE"), nullable=False),
        sa.Column("factory_downtime_id", sa.BigInteger(),
                  sa.ForeignKey("factory_downtimes.id", ondelete="SET NULL")),
        sa.Column("description", sa.Text()),
        sa.Column("duration", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_input_feed_downtimes_lsr", "input_feed_downtimes", ["line_shift_report_id"])
    op.create_index("ix_input_feed_downtimes_factory", "input_feed_downtimes", ["factory_downtime_id"])

    # ── 7. filter_press_downtimes ─────────────────────────────────────────────
    op.create_table(
        "filter_press_downtimes",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("line_shift_report_id", sa.BigInteger(),
                  sa.ForeignKey("line_shift_reports.id", ondelete="CASCADE"), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("duration", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_filter_press_downtimes_lsr", "filter_press_downtimes", ["line_shift_report_id"])

    # ── query_log (debug table — no audit triggers, has its own asked_at) ─────
    op.create_table(
        "query_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("asked_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("tool_calls", sa.JSON()),
        sa.Column("answer", sa.Text()),
        sa.Column("llm_provider", sa.String(30)),
    )

    # ── Attach updated_at triggers to every domain table ──────────────────────
    for table in DOMAIN_TABLES:
        op.execute(f"""
            CREATE TRIGGER trg_{table}_updated_at
            BEFORE UPDATE ON {table}
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        """)

    # ── Read-only grants ──────────────────────────────────────────────────────
    op.execute("GRANT SELECT ON ALL TABLES IN SCHEMA public TO factory_ro")
    op.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO factory_ro")


def downgrade() -> None:
    for table in DOMAIN_TABLES:
        op.execute(f"DROP TRIGGER IF EXISTS trg_{table}_updated_at ON {table}")

    op.drop_table("query_log")
    op.drop_table("filter_press_downtimes")
    op.drop_table("input_feed_downtimes")
    op.drop_table("factory_downtimes")
    op.drop_table("line_shift_reports")
    op.drop_table("loads")
    op.drop_table("shifts")
    op.drop_table("supervisors")

    op.execute("DROP FUNCTION IF EXISTS set_updated_at()")
