# supervisors

Lookup table of shift supervisors. Referenced by `shifts.supervisor_id`
(one supervisor per shift covers both lines).

| column      | type        | notes                                  |
|-------------|-------------|----------------------------------------|
| id          | BIGSERIAL   | primary key                            |
| name        | TEXT        | NOT NULL, UNIQUE                       |
| created_at  | TIMESTAMPTZ | auto                                   |
| updated_at  | TIMESTAMPTZ | auto-updated on every UPDATE           |
