# Tables: daily_report, production_shift

## Table: daily_report

One row per Excel sheet. Holds header info that applies to a whole day.

| Column | Description |
|--------|-------------|
| id | primary key |
| report_date | Gregorian date of this report (DATE) — use this for date filters |
| jalali_date | Original Persian/Shamsi date string, e.g. `1405/01/05` |
| sheet_name | Sheet name in the original Excel file (e.g. `01_05`) |
| source_file | Original Excel filename |
| batch_code | Raw material batch code if present (e.g. `MIX (MAHCOARSE030711_MAH040701225`) |
| supervisors | Supervisor names from the report header |
| ingested_at | When this row was loaded into the DB |

---

## Table: production_shift

**Wide table** — one row per (date, shift, line). Joinable with `daily_report` on `report_date`. Holds 40+ columns covering:

### Identity
- **report_date** (DATE): Gregorian date — use for `WHERE` filters like `BETWEEN '2026-03-01' AND '2026-03-31'`
- **jalali_date** (TEXT): original Persian date string, e.g. `1405/01/05`
- **shift** (TEXT): `'day'` (شیفت روز), `'night'` (شیفت شب), or `'total'` (جمع کل)
- **line** (INT): production line — 1 or 2. NULL for `total` rows.
- **source_file** (TEXT): which Excel file this came from

### Production: daily values (this date only)
- **daily_feed_tonnage**: ore fed into the line that day, in tons (روزانه: میزان خوراک)
- **daily_concentrate_tonnage**: iron concentrate produced that day, in tons (روزانه: میزان تولید)
- **daily_recovery_percent**: recovery for that day, decimal 0–1 (روزانه: ریکاوری). Multiply by 100 for percentage.
- **ore_grade_code**: ore type/batch identifier, e.g. `MAH 040909225` (نوع بار)

### Production: monthly running totals (cumulative for the Persian month)
- **monthly_feed_tonnage** (ماهانه)
- **monthly_concentrate_tonnage**
- **monthly_recovery_percent** (decimal 0–1)

### Production: yearly running totals (cumulative for the Persian year)
- **yearly_feed_tonnage** (سالیانه)
- **yearly_concentrate_tonnage**
- **yearly_recovery_percent** (decimal 0–1)

### Throughput
- **throughput_ton_per_hour**: instant feed rate (Ton/h column U)

### Equipment hours per shift
- **factory_operation_hours** / **factory_downtime_hours**: factory uptime/downtime in hours
- **feed_input_operation_hours** / **feed_input_downtime_hours**: feed input system
- **drum_filter_1_hours**, **drum_filter_2_hours**: hours each drum filter ran
- **filter_press_operation_hours** / **filter_press_downtime_hours**: filter press uptime/downtime

### Material consumption per shift
- **flocculant_grams**: flocculant used (مصرف فلوکولانت)
- **flocculant_type**: flocculant type code, e.g. `A28` (نوع فلوکولانت)
- **water_consumption_m3**: water used in m³
- **ball_mill_primary_kg** / **ball_mill_secondary_kg**: grinding media added to primary/secondary mills

### Quality: feed
- **feed_fe_percent** (خوراک Fe%): iron content of feed, percentage 0–100
- **feed_feo_percent**: FeO content of feed
- **feed_moisture_percent**: feed moisture
- **feed_k80_microns**: feed particle size k80 in microns

### Quality: concentrate
- **concentrate_fe_percent** (کنسانتره Fe%): iron content of concentrate, typically 60–72
- **concentrate_feo_percent**
- **concentrate_moisture_percent**
- **concentrate_k80_microns**

### Quality: tailings
- **tailings_fe_percent** (باطله تیکنر Fe%)
- **tailings_feo_percent**
- **tailings_k80_microns**

### Quality: intermediate streams
- **primary_mill_output**, **secondary_mill_output**: ball mill output
- **hydrocyclone_1_overflow**, **hydrocyclone_2_overflow**
- **primary_mill_output_fe_percent**, **primary_mill_output_feo_percent**

### Quality: derived metrics
- **dry_weight_recovery_percent**: dry weight recovery (ریکاوری وزنی خشک)
- **assay_recovery_percent**: assay-based recovery (ریکاوری عیاری)
- **separation_efficiency_percent**: separation efficiency (بازدهی جدایش)
- **filter_cake_moisture_percent**: filter press cake moisture

---

## Important notes for query writing

1. **Recovery columns are decimals (0–1), not percentages**. Multiply by 100 if displaying as %, but `daily_recovery_percent = 0.7518` already means 75.18%.
2. **Always filter `WHERE shift != 'total'`** when computing averages or sums by shift, otherwise the `total` rows double-count.
3. **NULL means missing or `#DIV/0!`** in the source — exclude with `IS NOT NULL` for averages.
4. **Date filtering**: user usually asks in Jalali. Convert Jalali→Gregorian first, then use `report_date BETWEEN`. Reference: `1405/01/01` ≈ `2026-03-21`.

---

## Example queries

Average concentrate Fe% in month 1 of 1405 (Farvardin):
```sql
SELECT AVG(concentrate_fe_percent) FROM production_shift
WHERE report_date BETWEEN '2026-03-21' AND '2026-04-20'
  AND shift != 'total'
  AND concentrate_fe_percent IS NOT NULL;
```

Total concentrate by shift this week:
```sql
SELECT shift, SUM(daily_concentrate_tonnage)
FROM production_shift
WHERE report_date >= CURRENT_DATE - INTERVAL '7 days'
  AND shift IN ('day','night')
GROUP BY shift;
```

Highest-recovery days:
```sql
SELECT report_date, line, daily_recovery_percent * 100 as recovery_pct
FROM production_shift
WHERE shift != 'total' AND daily_recovery_percent IS NOT NULL
ORDER BY daily_recovery_percent DESC LIMIT 10;
```

Compare day vs night Fe%:
```sql
SELECT shift, AVG(concentrate_fe_percent) as avg_fe
FROM production_shift
WHERE shift IN ('day','night') AND concentrate_fe_percent IS NOT NULL
GROUP BY shift;
```
