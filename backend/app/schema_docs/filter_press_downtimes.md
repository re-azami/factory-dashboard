# filter_press_downtimes

Downtime events for the filter press on a specific line/shift.

| column               | type         | notes                                                                  |
|----------------------|--------------|------------------------------------------------------------------------|
| id                   | BIGSERIAL    | primary key                                                            |
| line_shift_report_id | BIGINT       | FK → `line_shift_reports.id`, ON DELETE CASCADE                        |
| description          | TEXT         | original Persian description, never modified                           |
| duration             | INTEGER      | duration in **minutes**                                                |
| embedding            | vector(1024) | BGE-M3 embedding of `description`; powers `semantic_search`. NOT NULL. |
| category             | TEXT         | normalized English category (see values below). NOT NULL.              |
| department_tag       | TEXT NULL    | raw Persian tag parsed from trailing `(...)`.                          |
| equipment_codes      | TEXT[] NULL  | ISA-style codes from description (e.g. `{930FP01}`).                   |
| start_time           | TIME NULL    | parsed from `از ساعت X الی Y`.                                         |
| end_time             | TIME NULL    | parsed from `از ساعت X الی Y`.                                         |
| is_planned           | BOOLEAN      | NOT NULL. True for cloth changes, scheduled maintenance, etc.          |
| created_at           | TIMESTAMPTZ  | auto                                                                   |
| updated_at           | TIMESTAMPTZ  | auto                                                                   |

## `category` values

One of: `electrical`, `mechanical`, `production`, `planned_management`, `logistics`,
`crusher`, `filter_press`, `construction`, `safety`, `cleaning`, `line_stopped`, `other`.

## SQL idioms

- Filter by equipment: `WHERE '930FP01' = ANY(equipment_codes)`
- Filter by category: `WHERE category = 'filter_press'`
- Unplanned downtime only: `WHERE NOT is_planned`
