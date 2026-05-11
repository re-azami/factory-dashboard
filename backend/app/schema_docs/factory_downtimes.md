# factory_downtimes

Factory-wide downtime events. One row per discrete event (one Excel row).

| column               | type         | notes                                                                                          |
|----------------------|--------------|------------------------------------------------------------------------------------------------|
| id                   | BIGSERIAL    | primary key                                                                                    |
| line_shift_report_id | BIGINT       | FK → `line_shift_reports.id`, ON DELETE CASCADE                                                |
| description          | TEXT         | original Persian description, never modified                                                   |
| duration             | INTEGER      | duration in **minutes**                                                                        |
| embedding            | vector(1024) | BGE-M3 embedding of `description`; powers `semantic_search`. NOT NULL.                         |
| category             | TEXT         | normalized English category (see values below). NOT NULL.                                      |
| department_tag       | TEXT NULL    | raw Persian tag parsed from the trailing `(...)` in `description`, e.g. `برق`, `مدیریت`.       |
| equipment_codes      | TEXT[] NULL  | array of ISA-style equipment codes mentioned in `description`, e.g. `{110MI01,230TH01}`.       |
| start_time           | TIME NULL    | parsed from `از ساعت X الی Y` phrase; NULL when the phrase is absent.                          |
| end_time             | TIME NULL    | parsed from `از ساعت X الی Y` phrase; NULL when the phrase is absent.                          |
| is_planned           | BOOLEAN      | NOT NULL. True for overhauls, scheduled maintenance, holidays, power-management decisions.     |
| created_at           | TIMESTAMPTZ  | auto                                                                                           |
| updated_at           | TIMESTAMPTZ  | auto                                                                                           |

- An `input_feed_downtimes` row may reference a row here via `factory_downtime_id`
  when the feed stoppage was caused by a factory stoppage.

## `category` values

One of: `electrical`, `mechanical`, `production`, `planned_management`, `logistics`,
`crusher`, `filter_press`, `construction`, `safety`, `cleaning`, `line_stopped`, `other`.

## SQL idioms

- Filter by equipment: `WHERE '110MI01' = ANY(equipment_codes)`
- Filter by category: `WHERE category = 'electrical'`
- Unplanned downtime only: `WHERE NOT is_planned`
- Semantic match: use the `semantic_search` tool, not raw SQL — it handles the embedding lookup.
