"""Tests for the python_exec sandboxed tool used by the deep agent."""
import json
import subprocess
from unittest.mock import patch

import pytest

from app.tools import python_exec


class TestSnippetExecution:
    def test_prints_result(self):
        out = json.loads(python_exec.run("print(2 + 2)"))
        assert out["stdout"].strip() == "4"

    def test_uses_stdlib_prelude(self):
        """math/statistics/json/etc. should be importable without explicit import."""
        out = json.loads(python_exec.run("print(math.sqrt(16))"))
        assert out["stdout"].strip() == "4.0"

    def test_returns_empty_note_when_no_output(self):
        out = json.loads(python_exec.run("x = 1 + 1"))
        assert out["stdout"] == ""
        assert "remember to print" in out["note"]


class TestErrors:
    def test_syntax_error_surfaces_in_stderr(self):
        out = json.loads(python_exec.run("print(1 +"))
        assert "error" in out
        assert "SyntaxError" in out["error"] or "syntax" in out["error"].lower()

    def test_runtime_error_surfaces_in_stderr(self):
        out = json.loads(python_exec.run("raise ValueError('boom')"))
        assert "error" in out
        assert "boom" in out["error"] or "ValueError" in out["error"]

    def test_empty_code_is_rejected(self):
        out = json.loads(python_exec.run("   "))
        assert "error" in out
        assert "empty" in out["error"]


class TestSandboxLimits:
    def test_timeout_returns_clean_error(self):
        """When subprocess times out, we surface a structured error instead of crashing."""
        def fake_run(*_a, **_kw):
            raise subprocess.TimeoutExpired(cmd="python", timeout=python_exec.TIMEOUT_SECONDS)

        with patch.object(python_exec.subprocess, "run", side_effect=fake_run):
            out = json.loads(python_exec.run("while True: pass"))

        assert "error" in out
        assert "timed out" in out["error"]

    def test_output_is_truncated(self):
        """Very long stdout is capped so we don't blow up the LLM context."""
        loop = "for _ in range(5000): print('x' * 100)"
        out = json.loads(python_exec.run(loop))
        assert len(out["stdout"]) <= python_exec.MAX_OUTPUT_CHARS


class TestToolDefinition:
    def test_langchain_tool_shape(self):
        t = python_exec.python_exec
        assert t.name == "python_exec"
        schema = t.args_schema.model_json_schema()
        assert "code" in schema["properties"]
