"""
Source registry — list of recognised data source folder names.

The orchestrator is now the single dispatch point: it routes every file by
extension (.xlsx vs .pdf), and runs the production-template parser
automatically when a workbook matches its anchor labels. So the source name
is just a label that gets recorded against ingested files; it no longer
selects a parser.
"""

# Folder name → human label. The list exists so the upload UI can offer a
# dropdown and so /ingest can validate the query parameter without erroring
# on legacy values.
KNOWN_SOURCES = {
    "factory":  "Factory production reports",
    "kitchen":  "Kitchen logs",
    "store":    "Warehouse / store",
    "weighing": "Weighing station",
    "sales":    "Sales",
}


def is_known_source(source: str) -> bool:
    return source in KNOWN_SOURCES
