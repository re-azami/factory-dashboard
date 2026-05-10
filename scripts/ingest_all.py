"""
Full ingestion across all 5 production-template files.

  1405.xlsx, 1404.xlsx, 1403_01_04.xlsx, 1403_04-12.xlsx, 1402.xlsx

Every sheet that fails (parse error, missing-data error, anything else) is
recorded in a JSON report with the file, sheet name, phase, and full error
message. At the end an aggregate summary is printed and saved.

Run inside the backend container:
  docker compose exec -T -e PYTHONPATH=/app backend python /tmp/ingest_all.py
"""
from __future__ import annotations

import json
import sys
import time
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
REPORT_PATH = Path("/tmp/ingest_all_report.json")


def main() -> None:
    db = SessionLocal()
    started = time.time()
    file_summaries: list[dict] = []
    failures: list[dict] = []
    total_ok = 0
    total_fail = 0

    try:
        for fname in FILES:
            p = ROOT / fname
            if not p.exists():
                print(f"\n=== {fname}: MISSING ON DISK ===", flush=True)
                file_summaries.append({"file": fname, "status": "missing", "ok": 0, "failed": 0})
                continue

            wb = openpyxl.load_workbook(p, data_only=True, read_only=True)
            sheet_count = len(wb.sheetnames)
            wb.close()

            print(f"\n=== {fname} | {sheet_count} sheets — ingesting all ===", flush=True)
            t0 = time.time()
            result = ingest_workbook(db, p)        # sheet_names=None → every sheet
            elapsed = time.time() - t0

            ok = result.ok
            failed = result.failed
            total_ok += ok
            total_fail += failed
            print(f"  -> ok={ok} failed={failed} in {elapsed:.1f}s", flush=True)

            for s in result.sheets:
                if s.status == "error":
                    failures.append({
                        "file": fname,
                        "sheet": s.sheet_name,
                        "phase": s.phase,
                        "jalali_date": s.jalali_date,
                        "error": s.error,
                    })

            file_summaries.append({
                "file": fname,
                "sheets_total": sheet_count,
                "ok": ok,
                "failed": failed,
                "elapsed_seconds": round(elapsed, 1),
            })
    finally:
        db.close()

    elapsed_total = time.time() - started

    report = {
        "files": file_summaries,
        "total_ok": total_ok,
        "total_failed": total_fail,
        "elapsed_seconds": round(elapsed_total, 1),
        "failures": failures,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n" + "=" * 60)
    print(f"TOTAL: ok={total_ok}  failed={total_fail}  elapsed={elapsed_total:.1f}s")
    print(f"Report written to {REPORT_PATH}")

    # Quick categorization printed to stdout for live visibility.
    by_phase: dict[str, int] = {}
    for f in failures:
        by_phase[f["phase"] or "?"] = by_phase.get(f["phase"] or "?", 0) + 1
    print("\nFailures by phase:")
    for ph, n in sorted(by_phase.items(), key=lambda kv: -kv[1]):
        print(f"  {ph}: {n}")


if __name__ == "__main__":
    main()
