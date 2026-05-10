# shifts

One row per (date, shift) pair. Each shift covers **both lines** of the factory.

| column            | type        | notes                                                              |
|-------------------|-------------|--------------------------------------------------------------------|
| id                | BIGSERIAL   | primary key                                                        |
| shift             | VARCHAR(8)  | `'day'` or `'night'` (CHECK constraint enforces this)              |
| date              | DATE        | Gregorian date — use this for SQL date math                        |
| jalali_date       | TEXT        | Persian calendar string, e.g. `"1405/02/19"`                       |
| supervisor_id     | BIGINT NULL | FK → `supervisors.id`. One supervisor per shift covers both lines. |
| water_consumption | REAL        | total water consumption in cubic meters for this shift, both lines |
| downtime_description | TEXT NULL | free-text shift-level note from the daily report. In the source workbook it appears in red font in the input-feed-cause column with no associated duration; multiple notes joined with ` \| `. |
| created_at        | TIMESTAMPTZ | auto                                                               |
| updated_at        | TIMESTAMPTZ | auto                                                               |

- `UNIQUE(date, shift)` — there can be at most one day shift and one night shift per date.
- `1405/01/01` ≈ `2026-03-21`. Both calendars are populated for every shift.
