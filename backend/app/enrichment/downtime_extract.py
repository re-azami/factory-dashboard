"""One-time LLM extraction over downtime free-text.

Pulls equipment_code, fault_category, duration, start/end out of Persian
descriptions so they're queryable by SQL instead of vector search alone.
Run once per row at ingestion; results are stored on the Downtime model.
"""

from typing import TypedDict


class DowntimeExtraction(TypedDict, total=False):
    equipment_code: str
    fault_category: str
    duration_minutes: int
    start_time: str
    end_time: str


def extract(raw_text: str) -> DowntimeExtraction:
    raise NotImplementedError("Wire to Anthropic SDK in week 2.")
