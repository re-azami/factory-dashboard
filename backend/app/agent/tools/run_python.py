"""Sandboxed Python execution. Week 3 deliverable.

The intent is correlation / ad-hoc analysis: the agent writes pandas code that
reads from the read-only DB and returns a JSON-serialisable result. A real
sandbox (subprocess, resource limits, no network) goes here later.
"""

run_python_schema = {
    "name": "run_python",
    "description": (
        "Run a short pandas/numpy snippet for ad-hoc analysis. The variable "
        "`engine` is a read-only SQLAlchemy engine. Assign your final result "
        "to a variable named `result`."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "code": {"type": "string"},
        },
        "required": ["code"],
    },
}


def run_python(code: str) -> dict:
    return {"error": "run_python is not yet enabled (week 3 deliverable)"}
