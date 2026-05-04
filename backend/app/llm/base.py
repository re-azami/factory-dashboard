from abc import ABC, abstractmethod
from typing import Any


class LLMClient(ABC):
    """
    Shared interface that both ClaudeClient and OpenAICompatClient implement.
    The agent loop only talks to this interface — it doesn't know which LLM is behind it.
    """

    @abstractmethod
    def chat(
        self,
        system: str,
        messages: list[dict],
        tools: list[dict],
        max_tokens: int = 4096,
    ) -> "LLMResponse":
        """Send a conversation turn and return a structured response."""
        ...


class LLMResponse:
    """Normalised response from any LLM provider."""

    def __init__(
        self,
        content: str,                    # the text the model wrote
        tool_calls: list[dict] | None,   # list of {name, input} if model wants to call tools
        stop_reason: str,                # "end_turn" | "tool_use" | "stop"
        raw: Any = None,                 # original provider response (for debugging)
    ):
        self.content = content
        self.tool_calls = tool_calls or []
        self.stop_reason = stop_reason
        self.raw = raw

    @property
    def wants_tool(self) -> bool:
        return len(self.tool_calls) > 0
