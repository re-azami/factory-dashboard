import anthropic

from app.config import settings
from app.llm.base import LLMClient, LLMResponse


class ClaudeClient(LLMClient):
    """Calls the Anthropic API using the official SDK."""

    def __init__(self):
        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def chat(self, system: str, messages: list[dict], tools: list[dict], max_tokens: int = 4096) -> LLMResponse:
        response = self._client.messages.create(
            model=settings.llm_model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
            tools=tools,
        )

        # Extract text content
        text_parts = [b.text for b in response.content if hasattr(b, "text")]
        content = " ".join(text_parts)

        # Extract tool calls (Anthropic format: content blocks of type "tool_use")
        tool_calls = []
        for block in response.content:
            if block.type == "tool_use":
                tool_calls.append({"name": block.name, "input": block.input, "id": block.id})

        stop_reason = response.stop_reason  # "end_turn" or "tool_use"

        return LLMResponse(content=content, tool_calls=tool_calls, stop_reason=stop_reason, raw=response)

    def build_tool_result_message(self, tool_call: dict, result: str) -> dict:
        """Build the message that sends a tool result back to Claude."""
        return {
            "role": "user",
            "content": [{"type": "tool_result", "tool_use_id": tool_call["id"], "content": result}],
        }
