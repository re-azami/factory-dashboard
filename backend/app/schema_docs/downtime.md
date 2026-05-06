# Tables: downtime

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

For data that **isn't** in `production_shift` / `downtime` (e.g. older
yearly workbooks like `1402.xlsx`, daily PDFs), see `raw_data.md` — every
cell of every ingested file lives in `raw_xlsx_cells` / `raw_pdf_pages` /
`raw_pdf_table_cells` and is queryable with normal SQL.
