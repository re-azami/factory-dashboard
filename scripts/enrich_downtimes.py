"""
Backfill enrichment columns on the three downtime tables.

Idempotent: skips rows whose embedding AND category are already populated;
for partially-enriched rows, only the NULL fields are recomputed. Safe to
re-run at any time — also useful as a recovery tool when ingest-time
enrichment fails (network blip, embeddings service restart, etc.).

Run inside the backend container:

    docker compose exec -T backend python scripts/enrich_downtimes.py
"""
from __future__ import annotations

import sys
import time
from typing import Iterable

from sqlalchemy import or_

from app.database import SessionLocal
from app.enrichment.downtimes import enrich, stats
from app.models import FactoryDowntime, InputFeedDowntime, FilterPressDowntime


COMMIT_EVERY = 50
PROGRESS_EVERY = 50
FETCH_BATCH = 200  # rows per ID-pagination batch (avoids cursor-after-commit issue)

TABLES: list[tuple[str, type]] = [
    ("factory_downtimes", FactoryDowntime),
    ("input_feed_downtimes", InputFeedDowntime),
    ("filter_press_downtimes", FilterPressDowntime),
]

# Columns enrich() populates, in (model_attr, dict_key) pairs.
ENRICHED_FIELDS = (
    ("embedding", "embedding"),
    ("category", "category"),
    ("department_tag", "department_tag"),
    ("equipment_codes", "equipment_codes"),
    ("start_time", "start_time"),
    ("end_time", "end_time"),
    ("is_planned", "is_planned"),
)


def _reset_stats() -> None:
    stats.rows = 0
    stats.embed_ok = 0
    stats.embed_failed = 0
    stats.tag_hits = 0
    stats.hardcoded_hits = 0
    stats.llm_calls = 0
    stats.llm_invalid = 0
    stats.fallback_other = 0
    stats.codes_found = 0
    stats.by_category = {}


def _ids_needing_work(session, model) -> list[int]:
    """Return all IDs that still need work, materialized up-front.

    Picks up rows with NULL embedding/category AND rows where category
    landed in the fallback bucket 'other' — those are LLM-fallback failures
    worth retrying once API credits / network are restored.

    Materializing up-front avoids the server-side-cursor invalidation that
    happens when commit() is called mid-iteration with yield_per().
    """
    rows = (
        session.query(model.id)
        .filter(or_(
            model.embedding.is_(None),
            model.category.is_(None),
            model.category == "other",
        ))
        .order_by(model.id)
        .all()
    )
    return [r[0] for r in rows]


def _iter_rows_by_ids(session, model, ids: list[int]) -> Iterable:
    for start in range(0, len(ids), FETCH_BATCH):
        batch_ids = ids[start:start + FETCH_BATCH]
        rows = session.query(model).filter(model.id.in_(batch_ids)).all()
        # preserve original order so progress reads sensibly
        order = {rid: i for i, rid in enumerate(batch_ids)}
        rows.sort(key=lambda r: order[r.id])
        for r in rows:
            yield r


def _apply(row, result: dict) -> None:
    """Assign result fields onto row.

    Most fields are written only when the row currently has None (idempotent).
    `category` is a special case: rows landed in the fallback bucket 'other'
    when the LLM was unreachable, so on rerun we replace 'other' with a real
    category whenever the new result has one.
    """
    for attr, key in ENRICHED_FIELDS:
        current = getattr(row, attr, None)
        new = result[key]
        if current is None:
            setattr(row, attr, new)
        elif attr == "category" and current == "other" and new and new != "other":
            setattr(row, attr, new)


def backfill_table(name: str, model) -> None:
    print(f"\n=== {name} ===", flush=True)
    _reset_stats()
    db = SessionLocal()
    try:
        ids = _ids_needing_work(db, model)
        total = len(ids)
        if total == 0:
            print(f"  all rows already enriched — skipping", flush=True)
            return

        print(f"  rows to process: {total}", flush=True)
        started = time.time()
        processed = 0

        for row in _iter_rows_by_ids(db, model, ids):
            result = enrich(row.description)
            _apply(row, result)
            processed += 1

            if processed % COMMIT_EVERY == 0:
                db.commit()
            if processed % PROGRESS_EVERY == 0:
                elapsed = time.time() - started
                rate = processed / elapsed if elapsed > 0 else 0
                print(
                    f"  [{name}] {processed}/{total}  "
                    f"tag={stats.tag_hits} hardcoded={stats.hardcoded_hits} "
                    f"llm={stats.llm_calls} embed_fail={stats.embed_failed} "
                    f"({rate:.1f} rows/s)",
                    flush=True,
                )

        db.commit()
        elapsed = time.time() - started
        print(
            f"  done: {processed} rows in {elapsed:.1f}s "
            f"({processed / elapsed:.1f} rows/s)",
            flush=True,
        )
        _print_summary(name)
    finally:
        db.close()


def _print_summary(name: str) -> None:
    print(f"  summary for {name}:")
    print(f"    tag_hits        = {stats.tag_hits}")
    print(f"    hardcoded_hits  = {stats.hardcoded_hits}")
    print(f"    llm_calls       = {stats.llm_calls}")
    print(f"    llm_invalid     = {stats.llm_invalid}")
    print(f"    fallback_other  = {stats.fallback_other}")
    print(f"    embed_ok        = {stats.embed_ok}")
    print(f"    embed_failed    = {stats.embed_failed}")
    print(f"    codes_found     = {stats.codes_found}")
    print(f"    category histogram:")
    for cat, n in sorted(stats.by_category.items(), key=lambda kv: -kv[1]):
        print(f"      {cat:<22} {n}")


def main() -> int:
    print("Backfilling downtime enrichment columns...", flush=True)
    for name, model in TABLES:
        backfill_table(name, model)
    print("\nAll tables processed.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
