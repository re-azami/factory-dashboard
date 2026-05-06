# Tables: raw_files, raw_xlsx_cells, raw_pdf_pages, raw_pdf_table_cells

These tables hold **every cell of every file** ever ingested — the production
parser writes typed columns into `production_shift` / `downtime` for files it
recognises, and the bulk ingester additionally dumps every cell here so that
nothing is lost.

When the user asks about data that **isn't covered by `production_shift` or
`downtime`** (e.g. older yearly workbooks like `1402.xlsx` or `1404.xlsx`,
the daily PDFs, or anything in a sheet whose layout the typed parser doesn't
understand), query these tables.

---

## Table: raw_files

Registry of every ingested file. Use this to find a file's `id` before
querying the cell tables.

| Column | Description |
|--------|-------------|
| id | primary key — referenced as `file_id` in the other tables |
| path | path relative to the factory data folder (e.g. `1400.04/1400.04.05.pdf`) |
| filename | just the filename (e.g. `1402.xlsx`) — most useful for filtering |
| sha256 | content hash (idempotency key — duplicates are rejected) |
| kind | `'xlsx'` or `'pdf'` |
| size_bytes | file size |
| ingested_at | when the file was loaded |
| status | `'ok'` or `'error'` |
| error_message | populated when `status='error'` |

---

## Table: raw_xlsx_cells

One row per non-empty cell across **every** xlsx file ever ingested. Joined
with `raw_files` on `file_id`.

| Column | Description |
|--------|-------------|
| id | primary key |
| file_id | FK → raw_files.id |
| sheet_name | name of the worksheet (e.g. `01.05`, `Sheet1`) |
| sheet_index | 0-based position of the sheet in the workbook |
| row_idx | 1-based row number in the sheet |
| col_idx | 1-based column number (1=A, 2=B, …) |
| cell_address | Excel-style address (e.g. `C5`, `AB42`) |
| value_text | always populated with the string form of the cell value (use this for `ILIKE`) |
| value_num | populated when the cell parses as a number (use this for `SUM` / `AVG` / numeric filters) |
| value_date | populated when the cell is an Excel date |
| is_formula | always `false` (formulas are evaluated to their cached value before storage) |

### How to query

To pull every Fe% number from the 1402 workbook:
```sql
SELECT c.sheet_name, c.cell_address, c.value_num
FROM raw_xlsx_cells c
JOIN raw_files f ON f.id = c.file_id
WHERE f.filename = '1402.xlsx'
  AND c.value_num BETWEEN 50 AND 75
ORDER BY c.sheet_name, c.row_idx, c.col_idx;
```

To find which sheets in any file mention "فلوکولانت" (flocculant):
```sql
SELECT DISTINCT f.filename, c.sheet_name
FROM raw_xlsx_cells c
JOIN raw_files f ON f.id = c.file_id
WHERE c.value_text ILIKE '%فلوکولانت%';
```

To grab a value at a specific cell address:
```sql
SELECT value_text, value_num
FROM raw_xlsx_cells c
JOIN raw_files f ON f.id = c.file_id
WHERE f.filename = '1402.xlsx'
  AND c.sheet_name = '01.05'
  AND c.cell_address = 'C12';
```

---

## Table: raw_pdf_pages

One row per page of every PDF, with the full extracted text.

| Column | Description |
|--------|-------------|
| id | primary key |
| file_id | FK → raw_files.id |
| page_num | 1-based page number |
| text | full extracted text of the page (Persian) |
| char_count | length of `text` |

### How to query

Find PDFs that mention "خرابی" (failure):
```sql
SELECT f.filename, p.page_num, substring(p.text from 1 for 200) AS preview
FROM raw_pdf_pages p
JOIN raw_files f ON f.id = p.file_id
WHERE p.text ILIKE '%خرابی%'
LIMIT 20;
```

Total pages ingested across all PDFs:
```sql
SELECT COUNT(*) FROM raw_pdf_pages;
```

---

## Table: raw_pdf_table_cells

One row per cell of every table detected on every PDF page (via pdfplumber's
table extraction). Use this when the user is looking for **numeric** PDF
content (PDFs of daily reports usually contain a few tables).

| Column | Description |
|--------|-------------|
| id | primary key |
| file_id | FK → raw_files.id |
| page_num | 1-based page |
| table_idx | 0-based index of the table on the page |
| row_idx | 0-based row inside the table |
| col_idx | 0-based column inside the table |
| value_text | string form of the cell |
| value_num | numeric value if the cell parses as a number |

### How to query

All numeric values from any table in the daily PDF for 1400/04/05:
```sql
SELECT t.page_num, t.table_idx, t.row_idx, t.col_idx, t.value_text, t.value_num
FROM raw_pdf_table_cells t
JOIN raw_files f ON f.id = t.file_id
WHERE f.filename = '1400.04.05.pdf'
  AND t.value_num IS NOT NULL
ORDER BY t.page_num, t.table_idx, t.row_idx, t.col_idx;
```

---

## Important notes for query writing

1. **`value_text` is always populated** for any non-empty cell, so substring
   searches over Persian text work uniformly across all xlsx files. Use
   `value_num` for arithmetic.
2. **`raw_xlsx_cells` is huge** — always filter by `file_id` (or `filename`
   via a join to `raw_files`) before scanning. The trigram index on
   `value_text` makes `ILIKE` fast.
3. **Files are identified by filename or sha256**, not by date. To find all
   data for a specific Persian month, find the file first via `raw_files`,
   then filter cells by `sheet_name` (sheet names are usually `MM.DD` or
   `MM_DD`).
4. **Don't query raw_xlsx_cells for production data when you can query
   `production_shift`** — the typed columns there are cleaner. Only fall
   back to raw cells if the relevant column doesn't exist in
   `production_shift`.
