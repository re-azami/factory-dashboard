"""Tests for the parser registry."""
from app.ingestion.registry import get_parser, PARSERS
from app.ingestion.parser import parse_workbook as production_parser


class TestGetParser:
    def test_returns_factory_parser(self):
        assert get_parser("factory") is production_parser

    def test_unknown_source_returns_none(self):
        assert get_parser("kitchen") is None
        assert get_parser("nonsense") is None

    def test_empty_string_returns_none(self):
        assert get_parser("") is None

    def test_factory_is_registered(self):
        assert "factory" in PARSERS
