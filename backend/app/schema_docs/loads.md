# loads

Lookup table of input-feed batch codes. Each input feed delivered to a line carries
a code (e.g. `"MAH 040701225"`). Referenced by `line_shift_reports.load_id`.

| column     | type        | notes                       |
|------------|-------------|-----------------------------|
| id         | BIGSERIAL   | primary key                 |
| code       | TEXT        | NOT NULL, UNIQUE            |
| created_at | TIMESTAMPTZ | auto                        |
| updated_at | TIMESTAMPTZ | auto                        |
