"""
Smoke-test the daily-production parser+ingester on 5 random sheets per file.

Run inside the backend container:
  docker compose exec -T -e PYTHONPATH=/app backend python /tmp/test_ingest_v1.py
"""
from __future__ import annotations

import random
from pathlib import Path

import openpyxl

from app.database import SessionLocal
from app.ingestion.ingest_v1 import ingest_workbook


ROOT = Path("/data/raw/factory")
FILES = [
    "1405.xlsx",
    "1404.xlsx",
    "1403_01_04.xlsx",
    "1403_04-12.xlsx",
    "1402.xlsx",
]
N_SAMPLE = 20
SEED = 42


def main() -> None:
    rng = random.Random(SEED)
    db = SessionLocal()
    try:
        for fname in FILES:
            p = ROOT / fname
            if not p.exists():
                print(f"\n=== {fname} : MISSING ===")
                continue

            wb = openpyxl.load_workbook(p, data_only=True, read_only=True)
            all_sheets = list(wb.sheetnames)
            wb.close()
            sample = rng.sample(all_sheets, min(N_SAMPLE, len(all_sheets)))

            print(f"\n=== {fname} | sheets={len(all_sheets)} | sample={sample} ===")
            result = ingest_workbook(db, p, sheet_names=sample)
            for s in result.sheets:
                if s.status == "ok":
                    ids = s.ids
                    print(f"  [OK]   {s.sheet_name:>12}  jalali={s.jalali_date}  "
                          f"shifts=({ids.day_shift_id},{ids.night_shift_id}) "
                          f"lsrs=({ids.day_line1_lsr_id},{ids.day_line2_lsr_id},"
                          f"{ids.night_line1_lsr_id},{ids.night_line2_lsr_id})")
                elif s.phase == "missing_data":
                    print(f"  [MISS] {s.sheet_name:>12}  unexpectedly empty fields:")
                    for item in (s.error or "").split(" || "):
                        print(f"           - {item}")
                else:
                    print(f"  [FAIL] {s.sheet_name:>12}  phase={s.phase}  err={s.error}")
            print(f"  -> ok={result.ok} failed={result.failed}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
