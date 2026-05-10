# line_shift_reports

The main fact table. **One row per (shift, line)**, so two rows per shift
(line 1 and line 2). All production, equipment-hour, consumption, and quality
metrics for a single line during a single shift live here.

- `UNIQUE(shift_id, line_number, load_segment)` — at most one report per (shift, line, segment).
- `line_number` is `1` or `2` (CHECK enforces).
- `load_segment` is `1` or `2` (CHECK enforces). Most shifts run a single load
  → segment 1 only. When the operator changes feed mid-shift (downtime block contains
  the marker `'تعویض بار'`), a second LSR per line is produced with segment=2 holding
  the post-change production. Mill ball additions and quality readings live on
  segment=1 only (operators record those once per shift, not per load).
- `load_id` is nullable (the field may be missing on some reports). Supervisor
  is **not** here — it lives on `shifts.supervisor_id` (one supervisor per shift).

## Foreign keys

| column   | references | on delete |
|----------|------------|-----------|
| shift_id | shifts.id  | RESTRICT  |
| load_id  | loads.id   | RESTRICT  |

## Production

| column              | type    | notes                                                           |
|---------------------|---------|-----------------------------------------------------------------|
| input_feed_tonnage  | INTEGER | tons of feed delivered to this line in this shift               |
| production_tonnage  | INTEGER | tons of concentrate produced                                    |
| recovery            | REAL    | whole-number percent. 0 when input is 0. Stored as Excel reports — may differ slightly from `production_tonnage / input_feed_tonnage * 100` due to Excel rounding. |

## Equipment hours (decimal hours)

| column                        | notes                                          |
|-------------------------------|------------------------------------------------|
| operation_hour                | hours line was operating                       |
| downtime_hour                 | hours line was stopped                         |
| ton_per_hour                  | as Excel reports it (≈ `input_feed_tonnage / operation_hour`). Stored value, may differ slightly from the formula due to rounding. |
| drum_filter_1_hour            | drum filter 1 operating hours                  |
| drum_filter_2_hour            | drum filter 2 operating hours                  |
| filter_press_operation_hour   | filter press operating hours                   |
| filter_press_downtime_hour    | filter press downtime hours                    |

## Consumption

| column                       | type    | notes                                                  |
|------------------------------|---------|--------------------------------------------------------|
| flocculant_consumption_grams | INTEGER | grams                                                  |
| flocculant_type              | TEXT    | code/grade, e.g. `"A28"`                               |

### Ball additions to mills (count of balls of each diameter)

Primary mill: `primary_mill_30`, `primary_mill_40`, `primary_mill_50`, `primary_mill_60` (mm).
Secondary mill: `secondary_mill_25`, `secondary_mill_30`, `secondary_mill_40`, `secondary_mill_50` (mm).

All are INTEGER counts (number of balls added during the shift).

## Quality — Fe / FeO percentages (whole-number percent)

| column                    | location                                |
|---------------------------|-----------------------------------------|
| fe_input_feed             | input feed Fe %                         |
| feo_input_feed            | input feed FeO %                        |
| fe_concentrate            | final concentrate Fe %                  |
| feo_concentrate           | final concentrate FeO %                 |
| fe_thickener_tailing      | thickener tailings Fe %                 |
| feo_thickener_tailing     | thickener tailings FeO %                |
| fe_first_ballmill_output  | first ball mill output Fe %             |
| feo_first_ballmill_output | first ball mill output FeO %            |

## K80 particle sizes (microns, integer)

| column                            | stream                                    |
|-----------------------------------|-------------------------------------------|
| k80_size_input_feed               | input feed                                |
| k80_size_primary_ballmill         | primary ball mill output                  |
| k80_size_secondary_ballmill       | secondary ball mill output                |
| k80_size_hydrocyclone_overflow_1  | hydrocyclone overflow 1                   |
| k80_size_hydrocyclone_overflow_2  | hydrocyclone overflow 2                   |
| k80_size_tailing                  | tailings                                  |
| k80_size_concentrate              | final concentrate                         |

## Recoveries / efficiency / moisture (whole-number percent)

| column                      | meaning                                  |
|-----------------------------|------------------------------------------|
| dry_weight_recovery         | dry weight recovery %                    |
| metallurgical_recovery      | metallurgical (assay-based) recovery %   |
| separation_efficiency       | overall separation efficiency %          |
| input_feed_moisture         | moisture in input feed %                 |
| concentrate_moisture        | moisture in final concentrate %          |
| filter_press_cake_moisture  | moisture in filter-press cake %          |
