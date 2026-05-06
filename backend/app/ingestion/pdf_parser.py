"""
PDF parser — extracts text per page and tabular data via pdfplumber.

Two outputs per file, matching the raw_pdf_pages and raw_pdf_table_cells tables:

  iter_pages(path)         → one record per page with full text
  iter_table_cells(path)   → one record per cell of every table on every page

Tables are detected with pdfplumber's default heuristics (line-based + word
clustering). For PDFs that are clean text (the company daily reports) this
catches headers and value tables reliably. For pages where pdfplumber finds
no tables, we still have the page text.
"""
from __future__ import annotations

from pathlib import Path
from typing import Iterator

import pypdf
import pdfplumber


_PERSIAN_DIGIT_TRANS = str.maketrans(
    "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩",
    "01234567890123456789",
)


def _maybe_number(s: str | None) -> float | None:
    if not s:
        return None
    cleaned = s.translate(_PERSIAN_DIGIT_TRANS).replace(",", "").replace(" ", "")
    if cleaned.endswith("%"):
        cleaned = cleaned[:-1]
    if cleaned in ("", "-", "—"):
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def iter_pages(path: str | Path) -> Iterator[dict]:
    """
    Yield one dict per page with the page's full text. Uses pypdf for speed.

    Dict shape matches RawPdfPage columns (sans file_id).
    """
    reader = pypdf.PdfReader(str(path))
    for i, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        yield {
            "page_num": i,
            "text": text,
            "char_count": len(text),
        }


def iter_table_cells(path: str | Path) -> Iterator[dict]:
    """
    Yield one dict per cell of every table detected on every page.

    Dict shape matches RawPdfTableCell columns (sans file_id). pdfplumber
    returns tables as List[List[str|None]]; we flatten to (row, col, value).
    """
    with pdfplumber.open(str(path)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            try:
                tables = page.extract_tables() or []
            except Exception:
                tables = []
            for table_idx, table in enumerate(tables):
                for row_idx, row in enumerate(table):
                    if row is None:
                        continue
                    for col_idx, cell in enumerate(row):
                        if cell is None:
                            continue
                        text = str(cell).strip()
                        if not text:
                            continue
                        yield {
                            "page_num": page_num,
                            "table_idx": table_idx,
                            "row_idx": row_idx,
                            "col_idx": col_idx,
                            "value_text": text,
                            "value_num": _maybe_number(text),
                        }
