"""Tests for Persian-to-Gregorian date conversion."""
from datetime import date

import pytest

from app.ingestion.jalali import to_gregorian


class TestToGregorian:
    def test_first_day_of_year_1405(self):
        # 1405/01/01 → 2026-03-21 (Nowruz)
        assert to_gregorian("1405/01/01") == date(2026, 3, 21)

    def test_with_dash_separator(self):
        assert to_gregorian("1405-01-01") == date(2026, 3, 21)

    def test_with_dot_separator(self):
        assert to_gregorian("1405.01.01") == date(2026, 3, 21)

    def test_with_whitespace(self):
        assert to_gregorian("  1405/01/05  ") == date(2026, 3, 25)

    def test_single_digit_month_and_day(self):
        # Should work even without zero padding
        assert to_gregorian("1404/1/1") == date(2025, 3, 21)

    def test_returns_none_for_empty(self):
        assert to_gregorian("") is None

    def test_returns_none_for_none(self):
        assert to_gregorian(None) is None

    def test_returns_none_for_garbage(self):
        assert to_gregorian("not a date") is None

    def test_returns_none_for_only_two_parts(self):
        assert to_gregorian("1405/01") is None

    def test_returns_none_for_invalid_month(self):
        # month 13 doesn't exist
        assert to_gregorian("1405/13/01") is None

    def test_returns_none_for_invalid_day_in_month(self):
        # day 32 doesn't exist in any month
        assert to_gregorian("1405/01/32") is None

    @pytest.mark.parametrize(
        "jalali, expected",
        [
            ("1404/12/29", date(2026, 3, 20)),  # last day of 1404
            ("1405/06/31", date(2026, 9, 22)),  # last day of month 6
            ("1405/12/29", date(2027, 3, 20)),  # last day of 1405
        ],
    )
    def test_known_conversions(self, jalali, expected):
        assert to_gregorian(jalali) == expected
