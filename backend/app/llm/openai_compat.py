import json
from openai import OpenAI

from app.config import settings
from app.llm.base import LLMClient, LLMResponse


class OpenAICompatClient(LLMClient):
    """
    Works with OpenAI cloud AND local Ollama models.
    Ollama exposes an OpenAI-compatible API at http://localhost:11434/v1
    so the same code works for both — only base_url and api_key differ.
    """

    def __init__(self):
        if settings.llm_provider == "ollama":
            self._client = OpenAI(
                base_url=settings.ollama_base_url,
                api_key=settings.ollama_api_key,
            )
        else:
            self._client = OpenAI(api_key=settings.openai_api_key)

    def chat(self, system: str, messages: list[dict], tools: list[dict], max_tokens: int = 4096) -> LLMResponse:
        # Convert tool definitions from Anthropic format → OpenAI function format
        openai_tools = [_to_openai_tool(t) for t in tools]

        full_messages = [{"role": "system", "content": system}] + messages

        response = self._client.chat.completions.create(
            model=settings.llm_model,
            max_tokens=max_tokens,
            messages=full_messages,
            tools=openai_tools if openai_tools else None,
        )

        choice = response.choices[0]
        message = choice.message

        content = message.content or ""

        tool_calls = []
        if message.tool_calls:
            for tc in message.tool_calls:
                tool_calls.append({
                    "name": tc.function.name,
                    "input": json.loads(tc.function.arguments),
                    "id": tc.id,
                })

        stop_reason = "tool_use" if tool_calls else "end_turn"

        return LLMResponse(content=content, tool_calls=tool_calls, stop_reason=stop_reason, raw=response)

    def build_tool_result_message(self, tool_call: dict, result: str) -> dict:
        """Build the message that sends a tool result back to the model."""
        return {
            "role": "tool",
            "tool_call_id": tool_call["id"],
            "content": result,
        }


def _to_openai_tool(tool: dict) -> dict:
    """Convert Anthropic-style tool definition to OpenAI function format."""
    return {
        "type": "function",
        "function": {
            "name": tool["name"],
            "description": tool.get("description", ""),
            "parameters": tool.get("input_schema", {}),
        },
    }
