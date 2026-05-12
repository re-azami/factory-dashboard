"""DeepSeek-aware `ChatOpenAI` that round-trips `reasoning_content`.

Background
----------
DeepSeek's reasoning models return a `reasoning_content` field alongside the
assistant message. When `reasoning_effort` is set and the conversation has
more than one turn (e.g. after a tool call), the API rejects requests whose
prior assistant messages don't echo `reasoning_content` back:

    "The reasoning_content in the thinking mode must be passed back to the API."

Vanilla `langchain_openai.ChatOpenAI` drops the field on both legs:
  - on parse, `_convert_dict_to_message` ignores `reasoning_content`;
  - on serialize, `_convert_message_to_dict` doesn't emit it.

This subclass plugs both holes by overriding the two enclosing methods that
LangChain *does* expose for subclassing.
"""
from __future__ import annotations

from typing import Any

from langchain_core.language_models import LanguageModelInput
from langchain_core.messages import AIMessage
from langchain_core.outputs import ChatResult
from langchain_openai import ChatOpenAI


class DeepSeekChat(ChatOpenAI):
    """`ChatOpenAI` subclass that preserves DeepSeek's `reasoning_content`."""

    def _create_chat_result(
        self,
        response: Any,
        generation_info: dict | None = None,
    ) -> ChatResult:
        result = super()._create_chat_result(response, generation_info)

        response_dict = response if isinstance(response, dict) else response.model_dump()
        choices = response_dict.get("choices") or []
        for gen, choice in zip(result.generations, choices):
            reasoning = (choice.get("message") or {}).get("reasoning_content")
            if reasoning and isinstance(gen.message, AIMessage):
                gen.message.additional_kwargs["reasoning_content"] = reasoning
        return result

    def _get_request_payload(
        self,
        input_: LanguageModelInput,
        *,
        stop: list[str] | None = None,
        **kwargs: Any,
    ) -> dict:
        payload = super()._get_request_payload(input_, stop=stop, **kwargs)

        messages = self._convert_input(input_).to_messages()
        msg_dicts = payload.get("messages")
        if not msg_dicts or len(messages) != len(msg_dicts):
            return payload

        for src, dst in zip(messages, msg_dicts):
            if not isinstance(src, AIMessage):
                continue
            reasoning = src.additional_kwargs.get("reasoning_content")
            if reasoning and dst.get("role") == "assistant":
                dst["reasoning_content"] = reasoning
        return payload
