"""
Maps each data source folder name to its parser function.

To add a new Excel type (e.g. kitchen reports):
  1. Write backend/app/ingestion/parsers/kitchen.py with a parse_workbook() function
  2. Import it here and add one line to PARSERS
"""
from app.ingestion.parser import parse_workbook as production_parser

# Key = folder name under data/raw/
# Value = function that takes a file path and returns a ParseResult
PARSERS = {
    "factory": production_parser,
    # "kitchen":  kitchen_parser,   ← add here when ready
    # "store":    store_parser,
    # "weighing": weighing_parser,
    # "sales":    sales_parser,
}


def get_parser(source: str):
    """Return the parser for a given source folder name, or None if unknown."""
    return PARSERS.get(source)
