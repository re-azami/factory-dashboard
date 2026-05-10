# filter_press_downtimes

Downtime events for the filter press on a specific line/shift.

| column               | type        | notes                                          |
|----------------------|-------------|------------------------------------------------|
| id                   | BIGSERIAL   | primary key                                    |
| line_shift_report_id | BIGINT      | FK → `line_shift_reports.id`, ON DELETE CASCADE |
| description          | TEXT        | original Persian description, never modified   |
| duration             | INTEGER     | duration in **minutes**                        |
| created_at           | TIMESTAMPTZ | auto                                           |
| updated_at           | TIMESTAMPTZ | auto                                           |
