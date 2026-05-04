# Tables: downtime, raw_sheet_cells

## Table: downtime

One row per equipment stop event. The Excel report has THREE separate downtime sections — they all land in this table with a `section` column to distinguish them.

| Column | Description |
|--------|-------------|
| id | primary key |
| report_date | Gregorian date |
| jalali_date | Persian date string |
| **section** | `'factory'` (دلایل توقف کارخانه), `'feed_input'` (علت توقف فید ورودی), or `'filter_press'` (دلایل توقف فیلتر پرس) |
| shift | `'day'` / `'night'` / NULL |
| line | production line 1 or 2 (NULL if not specified) |
| **raw_text** | original Persian description (never modified) — use for semantic search |
| duration_minutes | how long the stop lasted, in minutes |
| equipment_code | extracted by enrichment, e.g. `110MI02`, `930FP01`, `210MI02` (NULL until enriched) |
| fault_category | `'electrical'` (برق), `'mechanical'` (مکانیک), `'operational'` (ساخت/مدیریت) — NULL until enriched |
| start_time | start time as `HH:MM` if extracted |
| end_time | end time as `HH:MM` if extracted |
| source_file | source Excel filename |

## How to query downtime

For structured questions (counts, sums, filters by section/category) → use `execute_sql`.
For fuzzy text questions ("what kinds of pump failures?", "thickener mudding") → use `semantic_search` (Phase 2).

Always filter by `section` when the question is about a specific subsystem:
- "factory stops" → `section = 'factory'`
- "feed line problems" → `section = 'feed_input'`
- "filter press issues" → `section = 'filter_press'`

## Example queries

Count stops per section:
```sql
SELECT section, COUNT(*) AS events, SUM(duration_minutes) AS total_min
FROM downtime
GROUP BY section
ORDER BY events DESC;
```

Electrical failures only:
```sql
SELECT report_date, raw_text, duration_minutes
FROM downtime
WHERE fault_category = 'electrical'
ORDER BY report_date DESC;
```

Most affected equipment:
```sql
SELECT equipment_code, COUNT(*) AS events, SUM(duration_minutes) AS total_min
FROM downtime
WHERE equipment_code IS NOT NULL
GROUP BY equipment_code
ORDER BY total_min DESC LIMIT 10;
```

---

## Table: raw_sheet_cells

**Insurance backup** — every non-empty cell from every sheet, dumped as JSON. One row per (date, sheet).

| Column | Description |
|--------|-------------|
| report_date | Gregorian date |
| sheet_name | original sheet name |
| source_file | Excel filename |
| **cells** | JSONB: `{ "A1": value, "C5": value, ... }` |

Use this when:
- The user asks about something not captured in the typed columns
- You want to verify a specific cell value
- Future analysis needs raw data we missed

Example — find any cell containing a specific equipment code:
```sql
SELECT report_date, sheet_name, key, value
FROM raw_sheet_cells, jsonb_each_text(cells)
WHERE value LIKE '%110MI02%';
```

Example — get all values from a specific cell across the year:
```sql
SELECT report_date, cells->>'AD15' AS flocculant_grams_at_AD15
FROM raw_sheet_cells
WHERE cells ? 'AD15'
ORDER BY report_date;
```
