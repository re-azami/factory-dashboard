"""
Derive structured fields from a Persian downtime description.

Most descriptions follow a stable pattern:

    <Persian narrative> ... از ساعت HH:MM الی HH:MM (<department tag>)

The operator's trailing parenthesized tag covers >99% of factory rows and >82%
of filter_press rows — that's the primary signal for `category`. Equipment
codes follow an ISA pattern like `\\d{3}[A-Z]{2}\\d{2}`. Times come from the
`از ساعت X الی Y` phrase. The LLM is only consulted as a last resort for
descriptions that lack a tag AND lack a hardcoded mapping.
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from datetime import time
from typing import Any

import httpx

from app.config import settings

log = logging.getLogger(__name__)


# ─── Taxonomy ─────────────────────────────────────────────────────────────────
TAXONOMY = (
    "electrical",
    "mechanical",
    "production",
    "planned_management",
    "logistics",
    "crusher",
    "filter_press",
    "construction",
    "safety",
    "cleaning",
    "line_stopped",
    "other",
)

# Persian-tag → English-category mapping. Keys are normalized via _norm_tag().
TAG_TO_CATEGORY = {
    "برق": "electrical",
    "تولید": "production",
    "مدیریت": "planned_management",
    "پشتیبانی": "logistics",
    "پشتبانی": "logistics",
    "مکانیک": "mechanical",
    "مانیک": "mechanical",
    "سنگ شکن": "crusher",
    "ماشین آلات": "logistics",
    "ماشین الات": "logistics",
    "ساخت": "construction",
    "فیلترپرس": "filter_press",
    "فیلتر پرس": "filter_press",
    "پایپینگ": "mechanical",
    "ایمنی": "safety",
    "نظافت صنعتی": "cleaning",
    "سایر": "other",
    "کارخانه": "other",
}

# Generic untagged strings that recur thousands of times — hardcode them so
# we don't waste LLM calls. Covers ~7900 input_feed_downtimes rows alone.
HARDCODED_DESCRIPTIONS = {
    "توقف خط": "line_stopped",
    "تو قف خط": "line_stopped",
    "توقف هط": "line_stopped",
    "توفف خط": "line_stopped",
    "نوقف خط": "line_stopped",
    "توقف کارخانه": "line_stopped",
}

PLANNED_KEYWORDS = (
    "اورهال",
    "تعمیرات",
    "تعطیل",
    "نوروز",
    "عاشورا",
    "تاسوعا",
    "مصرف بهینه",
    "بهینه سازی",
    "کاهش مصرف",
    "صرفه جویی",
    "PM",
)


# ─── Regex patterns ───────────────────────────────────────────────────────────
TAG_REGEX = re.compile(r"\(\s*([^()]+?)\s*\)\s*$")
CODE_REGEX = re.compile(r"\b(\d{3}\s?[A-Z]{2}\d{2}(?:[-/]\d{1,3})?)\b")
TIME_REGEX = re.compile(r"از\s*ساعت\s*(\d{1,2})\s*:\s*(\d{2})\s*الی\s*(\d{1,2})\s*:\s*(\d{2})")


# ─── Stats (used by the backfill script for its summary) ──────────────────────
@dataclass
class EnrichmentStats:
    rows: int = 0
    embed_ok: int = 0
    embed_failed: int = 0
    tag_hits: int = 0
    hardcoded_hits: int = 0
    llm_calls: int = 0
    llm_invalid: int = 0
    fallback_other: int = 0
    by_category: dict[str, int] = field(default_factory=dict)
    codes_found: int = 0


# Module-level shared stats; backfill reads & resets between tables.
stats = EnrichmentStats()


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _norm_tag(raw: str) -> str:
    """Collapse whitespace, strip, and unify common Persian variants."""
    s = re.sub(r"\s+", " ", raw).strip()
    # Compound tags ("مکانیک-پایپینگ", "پشتیبانی_سنگ شکن") — first segment wins
    s = re.split(r"[-_/]", s, maxsplit=1)[0].strip()
    return s


def _extract_codes(description: str) -> list[str]:
    matches = CODE_REGEX.findall(description)
    cleaned = []
    seen = set()
    for m in matches:
        c = re.sub(r"\s+", "", m).upper()
        if c not in seen:
            seen.add(c)
            cleaned.append(c)
    return cleaned


def _extract_tag(description: str) -> str | None:
    m = TAG_REGEX.search(description)
    if not m:
        return None
    return _norm_tag(m.group(1))


def _extract_times(description: str) -> tuple[time | None, time | None]:
    m = TIME_REGEX.search(description)
    if not m:
        return None, None
    try:
        sh, sm, eh, em = (int(x) for x in m.groups())
        # 24:00 sometimes appears; clamp to 23:59 rather than fail
        if sh == 24:
            sh, sm = 23, 59
        if eh == 24:
            eh, em = 23, 59
        return time(sh, sm), time(eh, em)
    except ValueError:
        return None, None


def _embed(description: str) -> list[float] | None:
    try:
        resp = httpx.post(
            f"{settings.embeddings_url}/embed",
            json={"text": description},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["embedding"]
    except Exception as exc:
        log.warning("embedding failed for %r: %s", description[:60], exc)
        return None


# ─── LLM fallback for category ────────────────────────────────────────────────
_LLM_SYSTEM = (
    "You classify Persian factory downtime descriptions into exactly one of these "
    "categories: " + " | ".join(TAXONOMY) + ". "
    "Reply with ONLY the category key (lowercase English, snake_case), nothing else. "
    "If unsure, reply with 'other'."
)

_llm_model = None  # lazy


def _get_model():
    global _llm_model
    if _llm_model is None:
        from app.llm import get_chat_model
        _llm_model = get_chat_model(max_tokens=20)
    return _llm_model


def _classify_via_llm(description: str) -> str:
    try:
        from langchain_core.messages import SystemMessage, HumanMessage
        model = _get_model()
        resp = model.invoke([
            SystemMessage(content=_LLM_SYSTEM),
            HumanMessage(content=description),
        ])
        content = resp.content
        if isinstance(content, list):
            content = "".join(b.get("text", "") for b in content if isinstance(b, dict))
        label = (content or "").strip().lower()
        if label in TAXONOMY:
            return label
        stats.llm_invalid += 1
        return "other"
    except Exception as exc:
        log.warning("LLM classification failed for %r: %s", description[:60], exc)
        return "other"


def _classify(description: str, tag: str | None) -> str:
    stripped = description.strip()

    if stripped in HARDCODED_DESCRIPTIONS:
        stats.hardcoded_hits += 1
        return HARDCODED_DESCRIPTIONS[stripped]

    if tag and tag in TAG_TO_CATEGORY:
        stats.tag_hits += 1
        return TAG_TO_CATEGORY[tag]

    # No tag, no hardcode → ask the LLM
    stats.llm_calls += 1
    return _classify_via_llm(description)


def _is_planned(description: str, category: str) -> bool:
    if category == "planned_management":
        return True
    return any(kw in description for kw in PLANNED_KEYWORDS)


def _empty_result() -> dict[str, Any]:
    return {
        "embedding": None,
        "category": "other",
        "department_tag": None,
        "equipment_codes": None,
        "start_time": None,
        "end_time": None,
        "is_planned": False,
    }


# ─── Public API ───────────────────────────────────────────────────────────────
def enrich(description: str | None) -> dict[str, Any]:
    """Return the seven derived fields for one downtime description.

    Never raises. On failure of any sub-step, the relevant field is None and
    a warning is logged — the caller can decide whether to persist NULL or
    retry later via the backfill script.
    """
    if not description or not description.strip():
        return _empty_result()

    stats.rows += 1
    desc = description.strip()

    codes = _extract_codes(desc)
    if codes:
        stats.codes_found += 1
    tag = _extract_tag(desc)
    category = _classify(desc, tag)
    if category == "other":
        stats.fallback_other += 1
    stats.by_category[category] = stats.by_category.get(category, 0) + 1

    start_t, end_t = _extract_times(desc)

    embedding = _embed(desc)
    if embedding is None:
        stats.embed_failed += 1
    else:
        stats.embed_ok += 1

    return {
        "embedding": embedding,
        "category": category,
        "department_tag": tag,
        "equipment_codes": codes if codes else None,
        "start_time": start_t,
        "end_time": end_t,
        "is_planned": _is_planned(desc, category),
    }
