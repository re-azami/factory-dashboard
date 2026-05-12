"""Tests for the LangChain chat-model factory."""
from unittest.mock import patch

import pytest


class TestGetChatModel:
    def test_anthropic_returns_chat_anthropic(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "anthropic")
        with patch("langchain_anthropic.ChatAnthropic") as ctor:
            ctor.return_value = object()
            llm.get_chat_model()
            assert ctor.called
            kwargs = ctor.call_args.kwargs
            assert kwargs["model"] == llm.settings.anthropic_model_simple
            assert kwargs["max_tokens"] == 4096
            assert "thinking" not in kwargs

    def test_anthropic_deep_mode_uses_opus_and_enables_thinking(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "anthropic")
        monkeypatch.setattr(llm.settings, "deep_thinking_budget_tokens", 16000)
        with patch("langchain_anthropic.ChatAnthropic") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(mode="deep")
            kwargs = ctor.call_args.kwargs
            assert kwargs["model"] == llm.settings.anthropic_model_deep
            assert kwargs["thinking"] == {"type": "enabled", "budget_tokens": 16000}
            # max_tokens must exceed the thinking budget
            assert kwargs["max_tokens"] > 16000

    def test_anthropic_deep_mode_skips_thinking_when_budget_zero(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "anthropic")
        monkeypatch.setattr(llm.settings, "deep_thinking_budget_tokens", 0)
        with patch("langchain_anthropic.ChatAnthropic") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(mode="deep")
            kwargs = ctor.call_args.kwargs
            assert "thinking" not in kwargs

    def test_openai_returns_chat_openai(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "openai")
        with patch("langchain_openai.ChatOpenAI") as ctor:
            ctor.return_value = object()
            llm.get_chat_model()
            assert ctor.called
            kwargs = ctor.call_args.kwargs
            assert kwargs["model"] == llm.settings.openai_model_simple
            assert "api_key" in kwargs
            assert "base_url" not in kwargs

    def test_openai_deep_mode_uses_deep_model(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "openai")
        monkeypatch.setattr(llm.settings, "openai_model_deep", "gpt-4-deep")
        with patch("langchain_openai.ChatOpenAI") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(mode="deep")
            kwargs = ctor.call_args.kwargs
            assert kwargs["model"] == "gpt-4-deep"

    def test_ollama_uses_openai_compat_with_base_url(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "ollama")
        with patch("langchain_openai.ChatOpenAI") as ctor:
            ctor.return_value = object()
            llm.get_chat_model()
            assert ctor.called
            kwargs = ctor.call_args.kwargs
            assert kwargs["base_url"] == llm.settings.ollama_base_url
            assert kwargs["model"] == llm.settings.llm_model

    def test_deepseek_uses_openai_compat_with_deepseek_base_url(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "deepseek")
        with patch("app.llm.deepseek_chat.DeepSeekChat") as ctor:
            ctor.return_value = object()
            llm.get_chat_model()
            assert ctor.called
            kwargs = ctor.call_args.kwargs
            assert kwargs["base_url"] == llm.settings.deepseek_base_url
            assert kwargs["model"] == llm.settings.deepseek_model_simple
            assert "extra_body" not in kwargs

    def test_deepseek_deep_mode_uses_pro_and_sets_reasoning_effort(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "deepseek")
        monkeypatch.setattr(llm.settings, "deep_reasoning_effort", "high")
        with patch("app.llm.deepseek_chat.DeepSeekChat") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(mode="deep")
            kwargs = ctor.call_args.kwargs
            assert kwargs["model"] == llm.settings.deepseek_model_deep
            assert kwargs["extra_body"] == {"reasoning_effort": "high"}

    def test_deepseek_deep_mode_skips_extra_body_when_effort_blank(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "deepseek")
        monkeypatch.setattr(llm.settings, "deep_reasoning_effort", "")
        with patch("app.llm.deepseek_chat.DeepSeekChat") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(mode="deep")
            assert "extra_body" not in ctor.call_args.kwargs

    def test_deepseek_deep_mode_floors_max_tokens_to_fit_reasoning(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "deepseek")
        with patch("app.llm.deepseek_chat.DeepSeekChat") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(mode="deep", max_tokens=4096)
            assert ctor.call_args.kwargs["max_tokens"] >= 8192

    def test_deepseek_simple_mode_keeps_caller_max_tokens(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "deepseek")
        with patch("app.llm.deepseek_chat.DeepSeekChat") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(mode="simple", max_tokens=4096)
            assert ctor.call_args.kwargs["max_tokens"] == 4096

    def test_unknown_provider_raises(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "magicmock")
        with pytest.raises(ValueError, match="Unknown LLM_PROVIDER"):
            llm.get_chat_model()

    def test_unknown_provider_error_lists_deepseek(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "magicmock")
        with pytest.raises(ValueError, match="deepseek"):
            llm.get_chat_model()

    def test_max_tokens_override_is_propagated(self, monkeypatch):
        from app import llm

        monkeypatch.setattr(llm.settings, "llm_provider", "anthropic")
        with patch("langchain_anthropic.ChatAnthropic") as ctor:
            ctor.return_value = object()
            llm.get_chat_model(max_tokens=20)
            assert ctor.call_args.kwargs["max_tokens"] == 20


class TestDeepSeekChatReasoningRoundTrip:
    """`DeepSeekChat` must capture `reasoning_content` from responses and
    echo it back on the next request — DeepSeek's reasoning models reject
    follow-up turns otherwise."""

    def _make_client(self):
        from app.llm.deepseek_chat import DeepSeekChat
        return DeepSeekChat(
            model="deepseek-reasoner",
            base_url="https://api.deepseek.com",
            api_key="test-key",
        )

    def test_create_chat_result_captures_reasoning_content(self):
        from langchain_core.messages import AIMessage

        client = self._make_client()
        raw_response = {
            "choices": [
                {
                    "index": 0,
                    "finish_reason": "stop",
                    "message": {
                        "role": "assistant",
                        "content": "42",
                        "reasoning_content": "first I thought, then I knew",
                    },
                }
            ],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2},
        }
        result = client._create_chat_result(raw_response)

        msg = result.generations[0].message
        assert isinstance(msg, AIMessage)
        assert msg.additional_kwargs["reasoning_content"] == "first I thought, then I knew"

    def test_create_chat_result_without_reasoning_content_leaves_kwargs_clean(self):
        client = self._make_client()
        raw_response = {
            "choices": [
                {
                    "index": 0,
                    "finish_reason": "stop",
                    "message": {"role": "assistant", "content": "42"},
                }
            ],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2},
        }
        result = client._create_chat_result(raw_response)
        assert "reasoning_content" not in result.generations[0].message.additional_kwargs

    def test_get_request_payload_reinjects_reasoning_content(self):
        from langchain_core.messages import AIMessage, HumanMessage

        client = self._make_client()
        messages = [
            HumanMessage(content="hi"),
            AIMessage(
                content="42",
                additional_kwargs={"reasoning_content": "stashed thoughts"},
            ),
            HumanMessage(content="why?"),
        ]
        payload = client._get_request_payload(messages)

        msg_dicts = payload["messages"]
        assistant_dict = next(m for m in msg_dicts if m.get("role") == "assistant")
        assert assistant_dict["reasoning_content"] == "stashed thoughts"

    def test_get_request_payload_skips_messages_without_reasoning(self):
        from langchain_core.messages import AIMessage, HumanMessage

        client = self._make_client()
        messages = [
            HumanMessage(content="hi"),
            AIMessage(content="42"),
        ]
        payload = client._get_request_payload(messages)

        for m in payload["messages"]:
            assert "reasoning_content" not in m
