# input_feed_downtimes

Downtime events for the input-feed system on a specific line/shift.

| column               | type         | notes                                                                  |
|----------------------|--------------|------------------------------------------------------------------------|
| id                   | BIGSERIAL    | primary key                                                            |
| line_shift_report_id | BIGINT       | FK → `line_shift_reports.id`, ON DELETE CASCADE                        |
| factory_downtime_id  | BIGINT NULL  | FK → `factory_downtimes.id`, ON DELETE SET NULL.                       |
|                      |              | Set only when the feed stop was caused by a factory-wide stop. NULL otherwise. |
| description          | TEXT         | original Persian description, never modified                           |
| duration             | INTEGER      | duration in **minutes**                                                |
| embedding            | vector(1024) | BGE-M3 embedding of `description`; powers `semantic_search`. NOT NULL. |
| category             | TEXT         | normalized English category (see values below). NOT NULL.              |
| department_tag       | TEXT NULL    | raw Persian tag parsed from trailing `(...)`, e.g. `برق`, `مدیریت`.    |
| equipment_codes      | TEXT[] NULL  | ISA-style codes extracted from description.                            |
| start_time           | TIME NULL    | parsed from `از ساعت X الی Y`.                                         |
| end_time             | TIME NULL    | parsed from `از ساعت X الی Y`.                                         |
| is_planned           | BOOLEAN      | NOT NULL. True for overhauls, maintenance, holidays, power-management. |
| created_at           | TIMESTAMPTZ  | auto                                                                   |
| updated_at           | TIMESTAMPTZ  | auto                                                                   |

Many rows in this table contain the generic description `توقف خط` ("line stopped"),
indicating the feed stopped because the line propagated a stop. These rows are
mapped to `category = 'line_stopped'`.

## `category` values

One of: `electrical`, `mechanical`, `production`, `planned_management`, `logistics`,
`crusher`, `filter_press`, `construction`, `safety`, `cleaning`, `line_stopped`, `other`.

## SQL idioms

- Filter by equipment: `WHERE '110MI01' = ANY(equipment_codes)`
- Filter by category: `WHERE category = 'electrical'`
- Unplanned downtime only: `WHERE NOT is_planned`
