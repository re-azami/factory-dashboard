"""Maps a file family (production, kitchen, sales, ...) to its parser module.

Adding a new Excel type is: drop a parser into parsers/, register it here.
"""

from app.ingestion.parsers import production

PARSERS = {
    "production": production,
}


def detect_family(filename: str) -> str:
    """Heuristic: pick the parser by filename prefix. Replace with a richer
    classifier (sheet headers, file metadata) once you have more file types."""
    name = filename.lower()
    if "kitchen" in name:
        return "kitchen"
    if "sales" in name or "buy" in name:
        return "sales"
    if "weigh" in name:
        return "weighing"
    return "production"


def ingest_file(filename: str, contents: bytes) -> dict:
    family = detect_family(filename)
    parser = PARSERS.get(family)
    if parser is None:
        return {"status": "skipped", "reason": f"no parser for family={family}"}
    return parser.ingest(filename, contents)
