"""Tests for canonical-form normalization of input-feed load codes.

The operator types the same physical batch with case, whitespace, and
Persian/Arabic script variations. normalize_load_code() must collapse
all variants to one canonical key so `loads.code UNIQUE` deduplicates.
"""
from app.ingestion.loads_normalize import normalize_load_code


class TestNormalizeLoadCode:
    def test_uppercases_letters(self):
        assert normalize_load_code("mah 040701225") == "MAH 040701225"

    def test_collapses_internal_whitespace(self):
        assert normalize_load_code("MAH    040701225") == "MAH 040701225"

    def test_strips_surrounding_whitespace(self):
        assert normalize_load_code("  MAH 040701225  ") == "MAH 040701225"

    def test_persian_digits_become_ascii(self):
        # ۰..۹ → 0..9
        assert normalize_load_code("MAH ۰۴۰۷۰۱۲۲۵") == "MAH 040701225"

    def test_arabic_digits_become_ascii(self):
        # ٠..٩ → 0..9
        assert normalize_load_code("MAH ٠٤٠٧٠١٢٢٥") == "MAH 040701225"

    def test_arabic_yeh_becomes_persian_yeh(self):
        # ي (Arabic) → ی (Persian)
        assert normalize_load_code("ميرا 100") == normalize_load_code("میرا 100")

    def test_arabic_kaf_becomes_persian_kaf(self):
        # ك (Arabic) → ک (Persian)
        assert normalize_load_code("كد 100") == normalize_load_code("کد 100")

    def test_strips_zwnj(self):
        # ZWNJ between letters must disappear so 'MAH‌001' == 'MAH001'
        assert normalize_load_code("MAH‌001") == "MAH001"

    def test_strips_tatweel(self):
        assert normalize_load_code("MAHـ001") == "MAH001"

    def test_strips_bom(self):
        assert normalize_load_code("﻿MAH 001") == "MAH 001"

    def test_nbsp_collapses_like_whitespace(self):
        # NBSP between letters should split into a single space
        assert normalize_load_code("MAH 001") == "MAH 001"

    def test_nfkc_compat_form_for_fullwidth(self):
        # Full-width A (Ａ) NFKC-folds to regular A
        assert normalize_load_code("ＭＡＨ 100") == "MAH 100"

    def test_idempotent(self):
        first = normalize_load_code("mah  ۰۴۰۷۰۱۲۲۵")
        assert normalize_load_code(first) == first

    def test_empty_input(self):
        assert normalize_load_code("") == ""
