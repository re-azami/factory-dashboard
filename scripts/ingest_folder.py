"""Batch-ingest every xlsx file in data/raw/ via the registry."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.ingestion.registry import ingest_file  # noqa: E402


def main(folder: str = "data/raw") -> None:
    root = Path(folder)
    for path in sorted(root.glob("*.xlsx")):
        result = ingest_file(path.name, path.read_bytes())
        print(path.name, result)


if __name__ == "__main__":
    main(*sys.argv[1:])
