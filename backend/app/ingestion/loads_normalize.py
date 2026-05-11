"""
Canonical form for `loads.code`.

Operators type the same physical batch with case, whitespace, and Persian/Arabic
script variations. We collapse these at ingest so each batch maps to exactly
one row in `loads`. See backend/app/schema_docs/loads.md for the user-facing
description.
"""
from __future__ import annotations

import unicodedata


_PERSIAN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
_LETTER_FIXES = str.maketrans({
    "ي": "ی",  # Arabic Yeh ي → Persian Yeh ی
    "ك": "ک",  # Arabic Kaf ك → Persian Kaf ک
})
_STRIP_CHARS = str.maketrans({
    "ـ": None,  # Arabic tatweel
    "‌": None,  # ZWNJ
    "‍": None,  # ZWJ
    "﻿": None,  # BOM
})


def normalize_load_code(code: str) -> str:
    s = unicodedata.normalize("NFKC", code)
    s = s.translate(_PERSIAN_DIGITS)
    s = s.translate(_ARABIC_DIGITS)
    s = s.translate(_LETTER_FIXES)
    s = s.translate(_STRIP_CHARS)
    s = " ".join(s.split())  # str.split() handles NBSP and any whitespace
    return s.upper()
