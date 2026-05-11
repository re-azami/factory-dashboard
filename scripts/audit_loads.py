"""
Audit loads.code for near-duplicates that differ only in Persian/Arabic digit
script, ZWNJ/tatweel, whitespace, Yeh/Kaf variants, or case. Read-only — does
not modify the database.

Run inside the backend container:

    docker compose exec -T backend python scripts/audit_loads.py

A CSV report is written to /tmp/loads_duplicates.csv inside the container.
Copy it out to the host with:

    docker compose cp backend:/tmp/loads_duplicates.csv data/audit/

Grouping uses the same normalize_load_code() applied at ingest, so any duplicate
group surfaced here is a genuine candidate for merge_loads.py.
"""
from __future__ import annotations

import csv
import sys
from collections import defaultdict
from pathlib import Path

from sqlalchemy import func, select

from app.database import SessionLocal
from app.ingestion.loads_normalize import normalize_load_code
from app.models import LineShiftReport, Load


# ── Main ─────────────────────────────────────────────────────────────────────

CSV_PATH = Path("/tmp/loads_duplicates.csv")


def main() -> int:
    db = SessionLocal()
    try:
        rows = db.execute(
            select(
                Load.id,
                Load.code,
                func.count(LineShiftReport.id).label("lsr_count"),
            )
            .select_from(Load)
            .outerjoin(LineShiftReport, LineShiftReport.load_id == Load.id)
            .group_by(Load.id)
        ).all()
    finally:
        db.close()

    total_loads = len(rows)

    groups: dict[str, list[tuple[int, str, int]]] = defaultdict(list)
    for load_id, code, lsr_count in rows:
        groups[normalize_load_code(code)].append((load_id, code, lsr_count))

    unique_norms = len(groups)
    dup_groups = {
        norm: members
        for norm, members in groups.items()
        if len({c for _, c, _ in members}) >= 2
    }

    sorted_groups = sorted(
        dup_groups.items(),
        key=lambda kv: (-sum(c for _, _, c in kv[1]), kv[0]),
    )

    total_affected_lsrs = sum(
        sum(c for _, _, c in members) for _, members in sorted_groups
    )

    if not sorted_groups:
        print("No near-duplicate loads found under current normalization rules.")
    else:
        # Column widths sized to the actual data
        norm_w = max(10, min(40, max(len(n) for n in dup_groups)))
        code_w = max(8, min(40, max(len(c) for _, members in dup_groups.items()
                                    for _, c, _ in members)))
        header = f"{'normalized':<{norm_w}}  {'raw_code':<{code_w}}  {'load_id':>8}  {'lsr_count':>10}"
        print(header)
        print("-" * len(header))
        for norm, members in sorted_groups:
            for load_id, code, count in sorted(members, key=lambda m: -m[2]):
                print(f"{norm:<{norm_w}}  {code:<{code_w}}  {load_id:>8}  {count:>10}")
            print()

    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["normalized", "raw_code", "load_id", "lsr_count"])
        for norm, members in sorted_groups:
            for load_id, code, count in sorted(members, key=lambda m: -m[2]):
                w.writerow([norm, code, load_id, count])

    loads_in_groups = sum(len(m) for _, m in sorted_groups)

    print("─" * 70)
    print(f"Total loads:                   {total_loads}")
    print(f"Unique normalized forms:       {unique_norms}")
    print(f"Merge-candidate groups:        {len(sorted_groups)}")
    print(f"Loads inside merge groups:     {loads_in_groups}")
    print(f"LSRs referencing those loads:  {total_affected_lsrs}")
    print()
    print(f"CSV written to {CSV_PATH} (inside container).")
    print(f"Copy out with: docker compose cp backend:{CSV_PATH} data/audit/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
