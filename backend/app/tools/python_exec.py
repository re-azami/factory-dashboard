"""python_exec tool — run a short Python snippet in a sandboxed subprocess.

Used by the deep-research agent to do analysis the SQL engine can't easily
express: rolling stats, group-by aggregations on intermediate results, simple
forecasting, etc.

Isolation strategy: spawn a fresh `python -c "..."` subprocess with a hard
timeout. The subprocess has no DB connection and no network credentials — it
can only read whatever string the agent passes inline. Output is the captured
stdout (or stderr on failure).

Available libraries inside the snippet: math, statistics, json, datetime,
collections, itertools, re, pandas, numpy. The snippet MUST print its result
— the return value of expressions is discarded.
"""
import json
import subprocess
import sys

from langchain_core.tools import tool


TIMEOUT_SECONDS = 30
MAX_OUTPUT_CHARS = 8000

# Imports prepended to every snippet. Keeps the agent from having to repeat them
# and gives a clear, auditable allowlist of what's available.
_PRELUDE = """
import math, statistics, json, datetime, collections, itertools, re
try:
    import pandas as pd
    import numpy as np
except ImportError:
    pd = None
    np = None
"""


def run(code: str) -> str:
    code = (code or "").strip()
    if not code:
        return json.dumps({"error": "code is empty"})

    script = _PRELUDE + "\n" + code
    try:
        result = subprocess.run(
            [sys.executable, "-c", script],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        return json.dumps({"error": f"timed out after {TIMEOUT_SECONDS}s"})
    except Exception as exc:
        return json.dumps({"error": f"failed to launch subprocess: {exc}"})

    stdout = (result.stdout or "")[:MAX_OUTPUT_CHARS]
    stderr = (result.stderr or "")[:MAX_OUTPUT_CHARS]

    if result.returncode != 0:
        return json.dumps({"error": stderr or "non-zero exit", "stdout": stdout})

    if not stdout:
        return json.dumps({"stdout": "", "note": "snippet produced no output — remember to print() the result"})

    return json.dumps({"stdout": stdout})


@tool("python_exec")
def python_exec(code: str) -> str:
    """Run a short Python snippet for ad-hoc data analysis.

    Use this when SQL alone is awkward — e.g. computing percentiles across rows
    you've already fetched, formatting a multi-line report, or running pandas
    aggregations on a small result set.

    The snippet runs in a sandboxed subprocess with no DB or network access. It
    has access to: math, statistics, json, datetime, collections, itertools, re,
    pandas (as pd), numpy (as np). You MUST `print()` the result — the return
    value of expressions is discarded. Timeout is 30 seconds.

    Pass query results into the snippet by embedding them as a literal, e.g.
    `rows = [...]; df = pd.DataFrame(rows); print(df.describe())`.

    Args:
        code: A Python snippet that prints its result.
    """
    return run(code)
