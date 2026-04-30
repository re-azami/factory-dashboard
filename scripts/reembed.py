"""Re-compute embeddings for all rows whose text changed or whose vector is null."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from sqlalchemy import select, update  # noqa: E402

from app.db.embeddings import embed_batch  # noqa: E402
from app.db.models import Downtime  # noqa: E402
from app.db.session import rw_engine  # noqa: E402

BATCH = 64


def main() -> None:
    with rw_engine().begin() as conn:
        rows = conn.execute(
            select(Downtime.id, Downtime.raw_text).where(Downtime.raw_text_embedding.is_(None))
        ).all()
        for i in range(0, len(rows), BATCH):
            chunk = rows[i : i + BATCH]
            vecs = embed_batch([r.raw_text for r in chunk])
            for row, vec in zip(chunk, vecs):
                conn.execute(
                    update(Downtime)
                    .where(Downtime.id == row.id)
                    .values(raw_text_embedding=vec)
                )
            print(f"embedded {i + len(chunk)} / {len(rows)}")


if __name__ == "__main__":
    main()
