# downtime

One row per downtime event recorded in the daily report. The `raw_text` column
holds the original Persian description; the structured fields are filled in
by a one-time LLM extraction pass at ingestion.

| column                 | meaning                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `report_date`          | Date of the report the entry was logged on.                              |
| `raw_text`             | Original Persian description as written by the operator.                 |
| `raw_text_embedding`   | BGE-M3 dense vector (1024-d). Use for `semantic_search`.                 |
| `equipment_code`       | e.g. `110MI02`, `930FP01`, `210MI02`. Extracted from text.               |
| `fault_category`       | One of `electrical` (برق), `mechanical` (مکانیک), `operational` (ساخت). |
| `duration_minutes`     | Repair duration in minutes.                                              |
| `start_time`           | Best-effort timestamp when the fault began.                              |
| `end_time`             | Best-effort timestamp when the fault was cleared.                        |

Prefer SQL over `equipment_code` / `fault_category` for counts. Use
`semantic_search` over `raw_text` for fuzzy queries (e.g. "thickener mudding").
