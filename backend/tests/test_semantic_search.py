"""Tests for the (Phase 2) semantic search tool."""
import json
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest

from app.tools import semantic_search


class TestSemanticSearchTool:
    def test_definition_shape(self):
        d = semantic_search.TOOL_DEFINITION
        assert d["name"] == "semantic_search"
        assert d["input_schema"]["required"] == ["query"]
        assert "limit" in d["input_schema"]["properties"]

    def test_returns_db_rows(self, monkeypatch):
        # 1. Mock the embeddings HTTP call
        embed_resp = MagicMock()
        embed_resp.json.return_value = {"embedding": [0.1, 0.2, 0.3]}
        embed_resp.raise_for_status = MagicMock()
        monkeypatch.setattr(semantic_search.httpx, "post", MagicMock(return_value=embed_resp))

        # 2. Mock the DB connection
        result = MagicMock()
        result.keys.return_value = ["id", "raw_text", "similarity"]
        result.fetchall.return_value = [(1, "خرابی برق", 0.92)]

        conn = MagicMock()
        conn.execute.return_value = result

        @contextmanager
        def fake_connect():
            yield conn

        monkeypatch.setattr(semantic_search.engine_ro, "connect", fake_connect)

        out = json.loads(semantic_search.run("electrical fault", limit=5))
        assert out["columns"] == ["id", "raw_text", "similarity"]
        assert len(out["rows"]) == 1
        assert out["rows"][0]["raw_text"] == "خرابی برق"

    def test_embedding_failure_returns_error(self, monkeypatch):
        def boom(*a, **kw):
            raise RuntimeError("embeddings server unreachable")

        monkeypatch.setattr(semantic_search.httpx, "post", boom)
        out = json.loads(semantic_search.run("anything"))
        assert "error" in out
        assert "embeddings server" in out["error"]
