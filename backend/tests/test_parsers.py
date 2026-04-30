"""Regression coverage for the production parser across template variants.

Drop one xlsx fixture per template version (58/59/63-row) into fixtures/ and
parametrise this test over them. Add the fixture for any new template version
the moment you encounter one in the wild.
"""

from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.skipif(not list(FIXTURES.glob("*.xlsx")), reason="no fixtures yet")
@pytest.mark.parametrize("path", list(FIXTURES.glob("*.xlsx")))
def test_production_parser(path: Path) -> None:
    from app.ingestion.parsers import production

    result = production.ingest(path.name, path.read_bytes())
    assert result["sheets_parsed"] > 0
    assert result["sheets_failed"] == 0
