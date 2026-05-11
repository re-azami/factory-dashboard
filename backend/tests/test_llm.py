"""Tests for the LangChain chat-model factory."""
from unittest.mock import patch

import pytest


class TestGetChatModel:
    def test_anthropic_returns_chat_anthropic(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "anthropic")
        with patch("langchain_anthropic.ChatAnthropic") as ctor:
            ctor.return_value = object()
            model = llm.get_chat_model()
            assert ctor.called
            kwargs = ctor.call_args.kwargs
            assert kwargs["model"] == llm.settings.llm_model
            assert kwargs["max_tokens"] == 4096

    def test_openai_returns_chat_openai(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "openai")
        with patch("langchain_openai.ChatOpenAI") as ctor:
            ctor.return_value = object()
            llm.get_chat_model()
            assert ctor.called
            kwargs = ctor.call_args.kwargs
            assert "api_key" in kwargs
            assert "base_url" not in kwargs

    def test_ollama_uses_openai_compat_with_base_url(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "ollama")
        with patch("langchain_openai.ChatOpenAI") as ctor:
            ctor.return_value = object()
            llm.get_chat_model()
            assert ctor.called
            kwargs = ctor.call_args.kwargs
            assert kwargs["base_url"] == llm.settings.ollama_base_url

    def test_unknown_provider_raises(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "magicmock")
        with pytest.raises(ValueError, match="Unknown LLM_PROVIDER"):
            llm.get_chat_model()

    def test_max_tokens_override_is_propagated(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "anthropic")
        with patch("langchain_anthropic.ChatAnthropic") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(max_tokens=20)
            assert ctor.call_args.kwargs["max_tokens"] == 20
