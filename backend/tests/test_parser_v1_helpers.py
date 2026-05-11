"""Tests for the pure helper functions in parser_v1.

These cover the conversion / normalization primitives the sheet walker
relies on. They run without an openpyxl Worksheet and are fast.
"""
from app.ingestion.parser_v1 import (
    _line_number_from_label,
    _norm,
    _to_float,
    _to_int,
    _to_str,
)


class TestNorm:
    def test_collapses_whitespace(self):
        assert _norm("foo   bar\t  baz") == "foo bar baz"

    def test_strips_outer(self):
        assert _norm("  hi  ") == "hi"

    def test_none_returns_empty(self):
        assert _norm(None) == ""

    def test_numeric_stringified(self):
        assert _norm(42) == "42"

    def test_persian_whitespace(self):
        # Persian text with multi-space inside (common in Excel exports)
        assert _norm(" شیفت  روز ") == "شیفت روز"


class TestToFloat:
    def test_int_in(self):
        assert _to_float(42) == 42.0

    def test_float_in(self):
        assert _to_float(3.14) == 3.14

    def test_str_numeric(self):
        assert _to_float("3.14") == 3.14

    def test_str_with_padding(self):
        assert _to_float("  3.14  ") == 3.14

    def test_none(self):
        assert _to_float(None) is None

    def test_empty_string(self):
        assert _to_float("") is None

    def test_excel_error_marker(self):
        # Cells with formula errors come through as '#DIV/0!' etc.
        assert _to_float("#DIV/0!") is None
        assert _to_float("#REF!") is None

    def test_garbage_string(self):
        assert _to_float("hello") is None


class TestToInt:
    def test_pure_int(self):
        assert _to_int(5) == 5

    def test_float_rounds(self):
        # 2.4 rounds to 2; 2.6 rounds to 3
        assert _to_int(2.4) == 2
        assert _to_int(2.6) == 3

    def test_str_numeric(self):
        assert _to_int("7") == 7

    def test_str_float_rounds(self):
        assert _to_int("7.6") == 8

    def test_none(self):
        assert _to_int(None) is None

    def test_garbage(self):
        assert _to_int("abc") is None


class TestToStr:
    def test_passes_string(self):
        assert _to_str("hello") == "hello"

    def test_collapses_whitespace(self):
        assert _to_str("  foo   bar  ") == "foo bar"

    def test_empty_returns_none(self):
        # Empty / whitespace-only cells should be None so loaders can skip them
        assert _to_str("") is None
        assert _to_str("   ") is None

    def test_none_returns_none(self):
        assert _to_str(None) is None

    def test_numeric_stringified(self):
        assert _to_str(42) == "42"


class TestLineNumberFromLabel:
    def test_simple_line_1(self):
        assert _line_number_from_label("خط 1") == 1

    def test_simple_line_2(self):
        assert _line_number_from_label("خط 2") == 2

    def test_no_space(self):
        assert _line_number_from_label("خط1") == 1
        assert _line_number_from_label("خط2") == 2

    def test_multi_space(self):
        assert _line_number_from_label("خط  1") == 1

    def test_annotated_label(self):
        # Operators sometimes write 'خط 2 (7:00-10:00) ...' in the line column
        assert _line_number_from_label("خط 2 (7:00-10:00) تعویض بار") == 2

    def test_unrelated_label(self):
        assert _line_number_from_label("شیفت روز") is None

    def test_empty_label(self):
        assert _line_number_from_label("") is None
        assert _line_number_from_label(None) is None

    def test_line_3_rejected(self):
        # Only 1 and 2 are valid lines
        assert _line_number_from_label("خط 3") is None
