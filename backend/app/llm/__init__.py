"""LangChain chat-model factory.

`get_chat_model()` returns a `BaseChatModel` configured from `LLM_PROVIDER`:
  - anthropic → langchain_anthropic.ChatAnthropic
  - openai   → langchain_openai.ChatOpenAI
  - ollama   → langchain_openai.ChatOpenAI pointed at Ollama's OpenAI-compatible endpoint

The agent and enrichment code talk to this single object via the standard
LangChain Runnable interface (`.invoke`, `.bind_tools`, `.stream`, ...).
"""
from langchain_core.language_models import BaseChatModel

from app.config import settings


def get_chat_model(max_tokens: int = 4096) -> BaseChatModel:
    provider = settings.llm_provider

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            max_tokens=max_tokens,
        )

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openai_api_key,
            max_tokens=max_tokens,
        )

    if provider == "ollama":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.llm_model,
            base_url=settings.ollama_base_url,
            api_key=settings.ollama_api_key,
            max_tokens=max_tokens,
        )

    raise ValueError(
        f"Unknown LLM_PROVIDER: {provider!r}. Choose: anthropic | openai | ollama"
    )
