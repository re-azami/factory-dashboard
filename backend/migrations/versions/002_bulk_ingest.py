"""Bulk-ingest tables: raw_files, raw_xlsx_cells, raw_pdf_pages, raw_pdf_table_cells.

Replaces the JSONB raw_sheet_cells table with flat queryable rows so the agent
can write plain SQL against every cell of every file.

Revision ID: 002
Create Date: 2026-05-06
"""
from alembic import op
import sqlalchemy as sa


revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The old JSONB dump is replaced by raw_xlsx_cells — drop it cleanly.
    op.drop_table("raw_sheet_cells")

    # ── raw_files ─────────────────────────────────────────────────────────────
    op.create_table(
        "raw_files",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("path", sa.Text, nullable=False),
        sa.Column("filename", sa.Text, nullable=False),
        sa.Column("sha256", sa.String(64), nullable=False, unique=True),
        sa.Column("kind", sa.String(10), nullable=False),
        sa.Column("size_bytes", sa.BigInteger, nullable=False),
        sa.Column("ingested_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("status", sa.String(10), nullable=False, server_default="ok"),
        sa.Column("error_message", sa.Text),
    )
    op.create_index("ix_raw_files_filename", "raw_files", ["filename"])
    op.create_index("ix_raw_files_kind", "raw_files", ["kind"])
    op.create_index("ix_raw_files_sha256", "raw_files", ["sha256"])

    # ── raw_xlsx_cells ────────────────────────────────────────────────────────
    op.create_table(
        "raw_xlsx_cells",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("file_id", sa.Integer, sa.ForeignKey("raw_files.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sheet_name", sa.String(120), nullable=False),
        sa.Column("sheet_index", sa.Integer, nullable=False),
        sa.Column("row_idx", sa.Integer, nullable=False),
        sa.Column("col_idx", sa.Integer, nullable=False),
        sa.Column("cell_address", sa.String(16), nullable=False),
        sa.Column("value_text", sa.Text),
        sa.Column("value_num", sa.Float),
        sa.Column("value_date", sa.Date),
        sa.Column("is_formula", sa.Boolean, nullable=False, server_default=sa.text("false")),
    )
    op.create_index("ix_raw_xlsx_cells_file_sheet", "raw_xlsx_cells", ["file_id", "sheet_name"])
    op.create_index("ix_raw_xlsx_cells_sheet", "raw_xlsx_cells", ["sheet_name"])

    # Trigram index so the agent can do `value_text ILIKE '%...%'` on Persian text fast.
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        "CREATE INDEX ix_raw_xlsx_cells_value_trgm "
        "ON raw_xlsx_cells USING gin (value_text gin_trgm_ops)"
    )

    # ── raw_pdf_pages ─────────────────────────────────────────────────────────
    op.create_table(
        "raw_pdf_pages",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("file_id", sa.Integer, sa.ForeignKey("raw_files.id", ondelete="CASCADE"), nullable=False),
        sa.Column("page_num", sa.Integer, nullable=False),
        sa.Column("text", sa.Text),
        sa.Column("char_count", sa.Integer, nullable=False, server_default="0"),
    )
    op.create_index("ix_raw_pdf_pages_file", "raw_pdf_pages", ["file_id"])
    op.execute(
        "CREATE INDEX ix_raw_pdf_pages_text_trgm "
        "ON raw_pdf_pages USING gin (text gin_trgm_ops)"
    )

    # ── raw_pdf_table_cells ───────────────────────────────────────────────────
    op.create_table(
        "raw_pdf_table_cells",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("file_id", sa.Integer, sa.ForeignKey("raw_files.id", ondelete="CASCADE"), nullable=False),
        sa.Column("page_num", sa.Integer, nullable=False),
        sa.Column("table_idx", sa.Integer, nullable=False),
        sa.Column("row_idx", sa.Integer, nullable=False),
        sa.Column("col_idx", sa.Integer, nullable=False),
        sa.Column("value_text", sa.Text),
        sa.Column("value_num", sa.Float),
    )
    op.create_index("ix_raw_pdf_table_cells_file_page", "raw_pdf_table_cells", ["file_id", "page_num"])

    # Re-grant SELECT to the read-only role on the new tables.
    op.execute("GRANT SELECT ON raw_files, raw_xlsx_cells, raw_pdf_pages, raw_pdf_table_cells TO factory_ro")


def downgrade() -> None:
    op.drop_table("raw_pdf_table_cells")
    op.execute("DROP INDEX IF EXISTS ix_raw_pdf_pages_text_trgm")
    op.drop_table("raw_pdf_pages")
    op.execute("DROP INDEX IF EXISTS ix_raw_xlsx_cells_value_trgm")
    op.drop_table("raw_xlsx_cells")
    op.drop_table("raw_files")

    # Recreate the old JSONB table so 001 stays consistent.
    op.create_table(
        "raw_sheet_cells",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("report_date", sa.Date, nullable=False, index=True),
        sa.Column("sheet_name", sa.String(50), nullable=False),
        sa.Column("source_file", sa.Text, nullable=False),
        sa.Column("cells", sa.JSON, nullable=False),
    )
