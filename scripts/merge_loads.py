"""
Merge duplicate `loads` rows surfaced by scripts/audit_loads.py.

Workflow:

    1. Run audit_loads.py — produces data/audit/loads_duplicates.csv.
    2. Open the CSV, add a `canonical_code` column. Set the same canonical
       value for every row inside one duplicate group. Rows with an empty
       canonical_code are skipped.
    3. Copy the edited CSV back into the container:
           docker compose cp data/audit/loads_duplicates.csv backend:/tmp/loads_duplicates.csv
    4. Run this script:
           docker compose exec -T backend python scripts/merge_loads.py --dry-run
           docker compose exec -T backend python scripts/merge_loads.py

The script does two things inside one transaction:

  Phase 1 — merge each duplicate group from the CSV into a single load
            (repoint line_shift_reports.load_id, delete extras, rename keeper
            to the canonical code).
  Phase 2 — canonicalize every remaining loads.code by applying
            normalize_load_code() to it. Idempotent: a code already in
            canonical form is left alone.

If phase 2 would create a UNIQUE conflict (i.e. a duplicate group not in the
CSV), the whole transaction aborts so nothing is left half-merged.
"""
from __future__ import annotations

import argparse
import csv
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import delete, select, update

from app.database import SessionLocal
from app.ingestion.loads_normalize import normalize_load_code
from app.models import LineShiftReport, Load


DEFAULT_CSV = Path("/tmp/loads_duplicates.csv")


@dataclass
class GroupAction:
    normalized: str
    canonical: str
    rows: list[tuple[int, str, int]]  # (load_id, raw_code, lsr_count)


def load_csv(path: Path) -> dict[str, GroupAction]:
    """Return {normalized -> GroupAction} for groups with a non-empty canonical_code."""
    if not path.exists():
        sys.exit(f"CSV not found: {path}")

    raw_groups: dict[str, list[dict]] = defaultdict(list)
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required = {"normalized", "raw_code", "load_id", "lsr_count", "canonical_code"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            sys.exit(f"CSV missing required columns: {sorted(missing)}. "
                     f"Add a `canonical_code` column to the audit CSV.")
        for row in reader:
            raw_groups[row["normalized"]].append(row)

    actions: dict[str, GroupAction] = {}
    for norm, rows in raw_groups.items():
        canonicals = {r["canonical_code"].strip() for r in rows}
        canonicals.discard("")
        if not canonicals:
            print(f"SKIP group '{norm}': no canonical_code set")
            continue
        if len(canonicals) > 1:
            sys.exit(f"ERROR group '{norm}': rows disagree on canonical_code: "
                     f"{sorted(canonicals)}")
        canonical = canonicals.pop()
        members = [(int(r["load_id"]), r["raw_code"], int(r["lsr_count"])) for r in rows]
        actions[norm] = GroupAction(normalized=norm, canonical=canonical, rows=members)

    return actions


def _pick_keeper(group: GroupAction) -> tuple[int, str, int]:
    """The load that survives: the one whose code already equals canonical, else
    the one with the most line_shift_reports."""
    exact = [m for m in group.rows if m[1] == group.canonical]
    if exact:
        return exact[0]
    return max(group.rows, key=lambda m: m[2])


def merge_groups(db, actions: dict[str, GroupAction]) -> tuple[int, int, int]:
    """Return (groups_merged, lsrs_repointed, loads_deleted)."""
    groups_merged = lsrs_repointed = loads_deleted = 0
    for action in actions.values():
        keeper_id, keeper_code, _ = _pick_keeper(action)
        non_keepers = [m for m in action.rows if m[0] != keeper_id]

        print(f"\nGroup '{action.normalized}' → canonical '{action.canonical}'")
        print(f"  keeper: load_id={keeper_id} (code={keeper_code!r})")

        for nk_id, nk_code, nk_lsrs in non_keepers:
            print(f"  merging load_id={nk_id} (code={nk_code!r}, {nk_lsrs} LSRs)"
                  f" → load_id={keeper_id}")
            result = db.execute(
                update(LineShiftReport)
                .where(LineShiftReport.load_id == nk_id)
                .values(load_id=keeper_id)
            )
            lsrs_repointed += result.rowcount or 0
            db.execute(delete(Load).where(Load.id == nk_id))
            loads_deleted += 1

        if keeper_code != action.canonical:
            # Make sure renaming the keeper won't collide with another load.
            conflict = db.execute(
                select(Load.id).where(
                    Load.code == action.canonical, Load.id != keeper_id
                )
            ).first()
            if conflict:
                sys.exit(f"ERROR: cannot rename load_id={keeper_id} to "
                         f"{action.canonical!r} — load_id={conflict[0]} already "
                         "holds that code (not in this group). "
                         "Re-run audit_loads.py to refresh duplicates.")
            print(f"  renaming keeper code {keeper_code!r} → {action.canonical!r}")
            db.execute(
                update(Load).where(Load.id == keeper_id).values(code=action.canonical)
            )
        groups_merged += 1

    return groups_merged, lsrs_repointed, loads_deleted


def canonicalize_singletons(db) -> int:
    """Apply normalize_load_code() to every remaining loads.code. Returns the
    number of rows updated. Aborts via sys.exit if any update would collide."""
    rows = db.execute(select(Load.id, Load.code)).all()
    updated = 0
    for load_id, code in rows:
        canonical = normalize_load_code(code)
        if canonical == code:
            continue
        conflict = db.execute(
            select(Load.id).where(Load.code == canonical, Load.id != load_id)
        ).first()
        if conflict:
            sys.exit(f"ERROR: load_id={load_id} {code!r} → {canonical!r} would "
                     f"collide with load_id={conflict[0]}. Add this pair to the "
                     "audit CSV with a canonical_code and re-run.")
        print(f"  canonicalize load_id={load_id}: {code!r} → {canonical!r}")
        db.execute(update(Load).where(Load.id == load_id).values(code=canonical))
        updated += 1
    return updated


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV,
                        help=f"path to edited audit CSV (default: {DEFAULT_CSV})")
    parser.add_argument("--dry-run", action="store_true",
                        help="run inside a transaction then ROLLBACK")
    args = parser.parse_args()

    actions = load_csv(args.csv)
    print(f"Loaded {len(actions)} merge group(s) from {args.csv}")

    db = SessionLocal()
    try:
        loads_before = db.execute(select(Load.id).select_from(Load)).all()
        print(f"Loads before: {len(loads_before)}")

        print("\n── Phase 1: merge duplicate groups ──")
        groups_merged, lsrs_repointed, loads_deleted = merge_groups(db, actions)

        print("\n── Phase 2: canonicalize singletons ──")
        singletons_renamed = canonicalize_singletons(db)

        loads_after = db.execute(select(Load.id).select_from(Load)).all()
        print("\n── Summary ──")
        print(f"  groups merged:        {groups_merged}")
        print(f"  LSRs repointed:       {lsrs_repointed}")
        print(f"  duplicate loads del:  {loads_deleted}")
        print(f"  singletons renamed:   {singletons_renamed}")
        print(f"  loads before / after: {len(loads_before)} → {len(loads_after)}")

        if args.dry_run:
            db.rollback()
            print("\nDRY-RUN: transaction rolled back, no changes committed.")
        else:
            db.commit()
            print("\nCommitted.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
