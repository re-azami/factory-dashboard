# production_shift

One row per (date, shift, line). Parsed from the daily production workbook.

| column                | meaning                                                    |
| --------------------- | ---------------------------------------------------------- |
| `report_date`         | Gregorian date of the shift (DATE).                        |
| `jalali_date`         | Same date in Jalali calendar, formatted `YYYY/MM/DD`.      |
| `shift`               | `day` or `night`.                                          |
| `line`                | Production line number (1, 2, ...).                        |
| `feed_tonnage`        | Tonnes of ore fed to the line during the shift.            |
| `concentrate_tonnage` | Tonnes of concentrate produced.                            |
| `fe_percent`          | Iron grade of the concentrate, %. Typical range 60-72.     |
| `recovery_percent`    | Recovery ratio, %. Missing values mean the assay was void. |

`#DIV/0!` cells in the source are stored as NULL.
