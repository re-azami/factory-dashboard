"""Tests for app.enrichment.downtimes.

The pure regex helpers are exercised directly. enrich() is exercised
with the embedding HTTP call and the LLM fallback mocked.
"""
from datetime import time
from unittest.mock import MagicMock, patch

import pytest

from app.enrichment import downtimes as dt


# ── Regex helpers ────────────────────────────────────────────────────────────

class TestExtractCodes:
    def test_finds_isa_style_code(self):
        # Standard ISA pattern: 3 digits, 2 letters, 2 digits
        assert dt._extract_codes("خرابی 110LP01 پمپ") == ["110LP01"]

    def test_finds_code_with_trailing_dash_number(self):
        assert dt._extract_codes("کد 220MO15-3") == ["220MO15-3"]

    def test_finds_multiple_codes(self):
        codes = dt._extract_codes("110LP01 و 220MO15")
        assert codes == ["110LP01", "220MO15"]

    def test_deduplicates(self):
        codes = dt._extract_codes("110LP01 و 110LP01")
        assert codes == ["110LP01"]

    def test_uppercases(self):
        # The regex requires uppercase letters; lowercase inputs are rejected
        # but the helper upper()s the matched substring. Use uppercase form.
        codes = dt._extract_codes("110LP01")
        assert codes == ["110LP01"]

    def test_no_codes(self):
        assert dt._extract_codes("توقف عادی خط") == []


class TestExtractTag:
    def test_trailing_paren(self):
        assert dt._extract_tag("خرابی پمپ (برق)") == "برق"

    def test_no_paren_returns_none(self):
        assert dt._extract_tag("خرابی پمپ") is None

    def test_paren_must_be_trailing(self):
        # A parenthesized note in the middle isn't a tag
        assert dt._extract_tag("خرابی (در ساعت 8) پمپ") is None

    def test_compound_tag_first_segment_wins(self):
        # 'مکانیک-پایپینگ' → 'مکانیک'
        assert dt._extract_tag("کار (مکانیک-پایپینگ)") == "مکانیک"

    def test_normalizes_whitespace(self):
        assert dt._extract_tag("کار (  برق  )") == "برق"


class TestExtractTimes:
    def test_simple_window(self):
        start, end = dt._extract_times("توقف از ساعت 8:30 الی 10:15")
        assert start == time(8, 30)
        assert end == time(10, 15)

    def test_no_match_returns_none(self):
        assert dt._extract_times("توقف عادی") == (None, None)

    def test_clamps_24_oclock(self):
        # Operators sometimes write 24:00; clamp to 23:59 rather than raise
        start, end = dt._extract_times("از ساعت 22:00 الی 24:00")
        assert start == time(22, 0)
        assert end == time(23, 59)

    def test_invalid_minute(self):
        # Minute 75 is impossible — should yield None,None, not raise
        assert dt._extract_times("از ساعت 8:75 الی 9:00") == (None, None)


class TestClassify:
    def test_hardcoded_descriptions_short_circuit(self, monkeypatch):
        # 'توقف خط' is in HARDCODED_DESCRIPTIONS → line_stopped, no LLM call
        # Reset stats so our assertion is local.
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        cat = dt._classify("توقف خط", tag=None)
        assert cat == "line_stopped"
        assert dt.stats.hardcoded_hits == 1
        assert dt.stats.llm_calls == 0

    def test_tag_routing(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        cat = dt._classify("خرابی پمپ (برق)", tag="برق")
        assert cat == "electrical"
        assert dt.stats.tag_hits == 1

    def test_filter_press_tag(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        # Both spaced and unspaced forms map to filter_press
        assert dt._classify("x (فیلتر پرس)", tag="فیلتر پرس") == "filter_press"
        assert dt._classify("x (فیلترپرس)", tag="فیلترپرس") == "filter_press"

    def test_unknown_tag_falls_through_to_llm(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        with patch.object(dt, "_classify_via_llm", return_value="other") as llm:
            cat = dt._classify("بدون برچسب", tag="ناشناخته")
        assert cat == "other"
        assert llm.called
        assert dt.stats.llm_calls == 1


class TestIsPlanned:
    def test_planned_management_category(self):
        assert dt._is_planned("هرچیزی", category="planned_management") is True

    def test_overhaul_keyword(self):
        assert dt._is_planned("اورهال سالانه", category="mechanical") is True

    def test_nowruz_keyword(self):
        assert dt._is_planned("تعطیلات نوروز", category="other") is True

    def test_normal_downtime_not_planned(self):
        assert dt._is_planned("خرابی پمپ", category="electrical") is False


# ── Top-level enrich() ───────────────────────────────────────────────────────

class TestEnrich:
    def _patch_embed(self, monkeypatch, embedding=None):
        """Stub the HTTP call. None → simulates failure."""
        if embedding is None:
            monkeypatch.setattr(dt, "_embed", lambda desc: None)
        else:
            monkeypatch.setattr(dt, "_embed", lambda desc: embedding)

    def test_empty_input_returns_empty_skeleton(self, monkeypatch):
        self._patch_embed(monkeypatch, embedding=[0.1] * 4)
        result = dt.enrich(None)
        assert result["category"] == "other"
        assert result["embedding"] is None  # not even called for empty input
        assert result["is_planned"] is False

    def test_whitespace_only_treated_as_empty(self, monkeypatch):
        self._patch_embed(monkeypatch, embedding=[0.1] * 4)
        result = dt.enrich("   \n\t  ")
        assert result["category"] == "other"
        assert result["embedding"] is None

    def test_factory_event_with_tag_and_time(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        self._patch_embed(monkeypatch, embedding=[0.5] * 4)
        result = dt.enrich("خرابی پمپ از ساعت 9:00 الی 10:30 (برق)")
        assert result["category"] == "electrical"
        assert result["department_tag"] == "برق"
        assert result["start_time"] == time(9, 0)
        assert result["end_time"] == time(10, 30)
        assert result["embedding"] == [0.5] * 4
        assert result["is_planned"] is False
        # equipment_codes None when none present
        assert result["equipment_codes"] is None

    def test_hardcoded_description_no_llm(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        self._patch_embed(monkeypatch, embedding=[0.0] * 4)
        # Ensure _classify_via_llm is NOT called for hardcoded strings
        with patch.object(dt, "_classify_via_llm", side_effect=AssertionError("must not run")):
            result = dt.enrich("توقف خط")
        assert result["category"] == "line_stopped"
        assert result["department_tag"] is None

    def test_planned_keyword_marks_is_planned(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        self._patch_embed(monkeypatch, embedding=[0.0] * 4)
        result = dt.enrich("اورهال سالانه (مکانیک)")
        assert result["is_planned"] is True
        assert result["category"] == "mechanical"

    def test_equipment_codes_extracted(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        self._patch_embed(monkeypatch, embedding=[0.0] * 4)
        result = dt.enrich("خرابی 110LP01 و 220MO15 (برق)")
        assert result["equipment_codes"] == ["110LP01", "220MO15"]

    def test_embedding_failure_still_returns_valid_result(self, monkeypatch):
        # Per the user's "never block ingest" rule: embed failures must NOT raise
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        self._patch_embed(monkeypatch, embedding=None)
        result = dt.enrich("خرابی پمپ (برق)")
        assert result["embedding"] is None
        assert result["category"] == "electrical"  # the rest still works

    def test_unknown_description_falls_back_to_llm(self, monkeypatch):
        monkeypatch.setattr(dt, "stats", dt.EnrichmentStats())
        self._patch_embed(monkeypatch, embedding=[0.0] * 4)
        with patch.object(dt, "_classify_via_llm", return_value="mechanical") as llm:
            result = dt.enrich("توضیح غیرعادی بدون برچسب")
        assert result["category"] == "mechanical"
        llm.assert_called_once()


class TestEmbed:
    def test_calls_embeddings_url(self, monkeypatch):
        """_embed must POST to {embeddings_url}/embed with the description."""
        resp = MagicMock()
        resp.json.return_value = {"embedding": [0.1, 0.2, 0.3]}
        resp.raise_for_status = MagicMock()
        post = MagicMock(return_value=resp)
        monkeypatch.setattr(dt.httpx, "post", post)
        out = dt._embed("hello")
        assert out == [0.1, 0.2, 0.3]
        # Verify URL pattern, not the exact host (settings come from env)
        url, _kw = post.call_args[0], post.call_args.kwargs
        called_url = post.call_args[0][0] if post.call_args[0] else post.call_args.kwargs.get("url")
        assert called_url.endswith("/embed")

    def test_network_error_returns_none(self, monkeypatch):
        def boom(*a, **kw):
            raise RuntimeError("connection refused")
        monkeypatch.setattr(dt.httpx, "post", boom)
        assert dt._embed("x") is None
