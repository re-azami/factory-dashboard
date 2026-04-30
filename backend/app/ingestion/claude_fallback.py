"""Claude-based fallback parser for sheets that fail deterministic parsing.

The rule-based parser is tried first; only edge sheets reach this path, so the
LLM cost stays trivial.
"""

from openpyxl.worksheet.worksheet import Worksheet


def claude_fallback_parse(ws: Worksheet) -> dict:
    raise NotImplementedError("Wire to Anthropic SDK in week 1.")
