"""Jalali ↔ Gregorian conversion for ingest-time date normalisation."""

from datetime import date

import jdatetime


def parse_jalali(value: str) -> date:
    """Accept '1405/01/05', '1405-01-05', or with Persian digits."""
    s = value.strip()
    s = s.translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789"))
    s = s.replace("-", "/")
    y, m, d = (int(p) for p in s.split("/"))
    return jdatetime.date(y, m, d).togregorian()


def to_jalali_str(g: date) -> str:
    j = jdatetime.date.fromgregorian(date=g)
    return f"{j.year:04d}/{j.month:02d}/{j.day:02d}"
