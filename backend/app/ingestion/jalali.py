"""
Convert Persian (Jalali/Shamsi) date strings to Python date objects.
Examples: "1405/01/05" → date(2026, 3, 25)
         "1405-01-05" → date(2026, 3, 25)
"""
import re
from datetime import date

import jdatetime


def to_gregorian(jalali_str: str) -> date | None:
    """
    Parse a Jalali date string and return a Gregorian date.
    Returns None if the string cannot be parsed.
    """
    if not jalali_str:
        return None

    # Normalise separators: accept / or - or .
    cleaned = re.sub(r"[/\-.]", "/", str(jalali_str).strip())
    parts = cleaned.split("/")

    if len(parts) != 3:
        return None

    try:
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        jdate = jdatetime.date(year, month, day)
        return jdate.togregorian()
    except (ValueError, TypeError):
        return None
