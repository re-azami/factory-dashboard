# input_feed_downtimes

Downtime events for the input-feed system on a specific line/shift.

| column               | type        | notes                                                              |
|----------------------|-------------|--------------------------------------------------------------------|
| id                   | BIGSERIAL   | primary key                                                        |
| line_shift_report_id | BIGINT      | FK → `line_shift_reports.id`, ON DELETE CASCADE                    |
| factory_downtime_id  | BIGINT NULL | FK → `factory_downtimes.id`, ON DELETE SET NULL.                   |
|                      |             | Set only when the feed stop was caused by a factory-wide stop.     |
|                      |             | NULL otherwise.                                                    |
| description          | TEXT        | original Persian description, never modified                       |
| duration             | INTEGER     | duration in **minutes**                                            |
| created_at           | TIMESTAMPTZ | auto                                                               |
| updated_at           | TIMESTAMPTZ | auto                                                               |
