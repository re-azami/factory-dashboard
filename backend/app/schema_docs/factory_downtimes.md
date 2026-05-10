# factory_downtimes

Factory-wide downtime events. One row per discrete event (one Excel row).

| column               | type        | notes                                    |
|----------------------|-------------|------------------------------------------|
| id                   | BIGSERIAL   | primary key                              |
| line_shift_report_id | BIGINT      | FK → `line_shift_reports.id`, ON DELETE CASCADE |
| description          | TEXT        | original Persian description, never modified |
| duration             | INTEGER     | duration in **minutes**                  |
| created_at           | TIMESTAMPTZ | auto                                     |
| updated_at           | TIMESTAMPTZ | auto                                     |

- An `input_feed_downtimes` row may reference a row here via
  `factory_downtime_id` when the feed stoppage was caused by a factory stoppage.
