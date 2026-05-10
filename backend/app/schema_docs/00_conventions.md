# Schema conventions

These conventions apply to **every** table in the factory database.

- **Percentages are stored as whole numbers**, exactly as the Excel reports show them.
  - Example: `49.95` means 49.95%, **not** 0.4995.
  - Applies to `recovery`, all `fe_*`/`feo_*` columns, `dry_weight_recovery`,
    `metallurgical_recovery`, `separation_efficiency`, and all `*_moisture` columns.
- **Plant has 2 production lines**: `line_number` is always `1` or `2`.
- **Shifts**: only two values — `'day'` and `'night'`. There is no `'total'` shift.
- **Both calendars are stored**: `shifts.date` is Gregorian (use this for SQL date math)
  and `shifts.jalali_date` is the Persian calendar string for display.
- **Downtime durations are minutes** (integer) in `factory_downtimes`,
  `input_feed_downtimes`, and `filter_press_downtimes`.
- **Equipment hours** (`operation_hour`, `downtime_hour`, `drum_filter_*_hour`,
  `filter_press_*_hour`, `ton_per_hour`) are stored as decimal **hours**, not minutes.
- Every table has `created_at` and `updated_at` (TIMESTAMPTZ). `updated_at` is
  auto-bumped by a trigger on every UPDATE.

## Table relationships

```
supervisors ─→ shifts ─→ line_shift_reports ─→ factory_downtimes
                            │              ├─→ input_feed_downtimes ─(optional)→ factory_downtimes
                  loads ────┘              └─→ filter_press_downtimes
```

- One `shift` row covers both lines for a given (date, shift) pair.
- `line_shift_reports` has one row per `(shift_id, line_number)` — i.e. two rows
  per shift, one for line 1 and one for line 2.
- All three downtime tables hang off `line_shift_reports` via `line_shift_report_id`.
- `input_feed_downtimes.factory_downtime_id` is **nullable**. It is set only when
  the input-feed stoppage was caused by a factory-wide stoppage; otherwise NULL.
