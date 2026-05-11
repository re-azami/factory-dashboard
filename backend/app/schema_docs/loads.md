# loads

Lookup table of input-feed batch codes. Each input feed delivered to a line carries
a code (e.g. `"MAH 040701225"`). Referenced by `line_shift_reports.load_id`.

| column     | type        | notes                       |
|------------|-------------|-----------------------------|
| id         | BIGSERIAL   | primary key                 |
| code       | TEXT        | NOT NULL, UNIQUE, canonical |
| created_at | TIMESTAMPTZ | auto                        |
| updated_at | TIMESTAMPTZ | auto                        |

Codes are canonicalized at ingest by `app.ingestion.loads_normalize.normalize_load_code`:
NFKC, Persian/Arabic digits → Latin, ي → ی, ك → ک, tatweel and zero-widths
stripped, whitespace collapsed to single ASCII space, ASCII letters uppercased.
So `Mah-Coarse 030711`, `mah-coarse 030711`, and `MAH-COARSE 030711` all collapse
to one row stored as `MAH-COARSE 030711`. Querying by `code` always uses the
uppercase canonical form.
