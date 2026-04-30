"""Claude tool-use loop. Streams Server-Sent Events to the API layer."""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

from anthropic import Anthropic

from app.agent.system_prompt import build_system_prompt
from app.agent.tools import TOOL_HANDLERS, TOOL_SCHEMAS
from app.config import get_settings
from app.query_log.query_log import log_turn

MAX_ITERATIONS = 8


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"


async def run_agent_stream(message: str, conversation_id: str | None) -> AsyncIterator[str]:
    settings = get_settings()
    client = Anthropic(api_key=settings.anthropic_api_key)
    system = build_system_prompt()

    messages: list[dict] = [{"role": "user", "content": message}]
    tool_calls: list[dict] = []

    for _ in range(MAX_ITERATIONS):
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=4096,
            system=system,
            tools=TOOL_SCHEMAS,
            messages=messages,
        )

        for block in response.content:
            if block.type == "text":
                yield _sse("text", {"text": block.text})

        if response.stop_reason != "tool_use":
            log_turn(conversation_id, message, tool_calls, final_text_blocks(response))
            yield _sse("done", {})
            return

        messages.append({"role": "assistant", "content": [b.model_dump() for b in response.content]})

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            handler = TOOL_HANDLERS.get(block.name)
            if handler is None:
                result = {"error": f"unknown tool {block.name}"}
            else:
                try:
                    result = handler(**block.input)
                except Exception as exc:
                    result = {"error": str(exc)}
            tool_calls.append({"name": block.name, "input": block.input, "result": result})
            yield _sse("tool", {"name": block.name, "input": block.input, "result": result})
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result, default=str),
                }
            )

        messages.append({"role": "user", "content": tool_results})

    yield _sse("error", {"message": "max iterations reached"})


def final_text_blocks(response) -> list[str]:
    return [b.text for b in response.content if b.type == "text"]
