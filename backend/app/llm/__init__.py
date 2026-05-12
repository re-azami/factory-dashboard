"""LangChain chat-model factory.

`get_chat_model(mode)` returns a `BaseChatModel` configured from `LLM_PROVIDER`
and the active agent mode (`simple` or `deep`):

  - anthropic → langchain_anthropic.ChatAnthropic
      simple: ANTHROPIC_MODEL_SIMPLE
      deep:   ANTHROPIC_MODEL_DEEP + extended thinking (DEEP_THINKING_BUDGET_TOKENS)
  - deepseek → langchain_openai.ChatOpenAI pointed at DeepSeek's OpenAI-compatible endpoint
      simple: DEEPSEEK_MODEL_SIMPLE
      deep:   DEEPSEEK_MODEL_DEEP + reasoning_effort=DEEP_REASONING_EFFORT
  - openai   → langchain_openai.ChatOpenAI
      simple: OPENAI_MODEL_SIMPLE
      deep:   OPENAI_MODEL_DEEP
  - ollama   → langchain_openai.ChatOpenAI pointed at Ollama's OpenAI-compatible endpoint
      uses LLM_MODEL for both modes (local runtimes load one model at a time)

The agent and enrichment code talk to this single object via the standard
LangChain Runnable interface (`.invoke`, `.bind_tools`, `.stream`, ...).
"""
from langchain_core.language_models import BaseChatModel

from app.config import settings


def get_chat_model(mode: str = "simple", max_tokens: int = 4096) -> BaseChatModel:
    provider = settings.llm_provider
    is_deep = mode == "deep"

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        model = settings.anthropic_model_deep if is_deep else settings.anthropic_model_simple
        kwargs: dict = {
            "model": model,
            "api_key": settings.anthropic_api_key,
            "max_tokens": max_tokens,
        }
        if is_deep and (budget := settings.deep_thinking_budget_tokens) > 0:
            # max_tokens must exceed thinking budget; bump it if caller's was too small.
            kwargs["max_tokens"] = max(max_tokens, budget + 4096)
            kwargs["thinking"] = {"type": "enabled", "budget_tokens": budget}
        return ChatAnthropic(**kwargs)

    if provider == "deepseek":
        # DeepSeek's reasoning models require `reasoning_content` to round-trip
        # in multi-turn conversations; the stock ChatOpenAI strips it on both
        # legs. DeepSeekChat is a thin subclass that preserves the field.
        from app.llm.deepseek_chat import DeepSeekChat
        model = settings.deepseek_model_deep if is_deep else settings.deepseek_model_simple
        kwargs = {
            "model": model,
            "base_url": settings.deepseek_base_url,
            "api_key": settings.deepseek_api_key,
            # In deep mode the response must fit both the reasoning chain and
            # the user-visible answer; bump the per-call ceiling so the model
            # doesn't get truncated mid-thought.
            "max_tokens": max(max_tokens, 8192) if is_deep else max_tokens,
        }
        if is_deep and settings.deep_reasoning_effort:
            kwargs["extra_body"] = {"reasoning_effort": settings.deep_reasoning_effort}
        return DeepSeekChat(**kwargs)

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        model = settings.openai_model_deep if is_deep else settings.openai_model_simple
        return ChatOpenAI(
            model=model,
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
        f"Unknown LLM_PROVIDER: {provider!r}. Choose: anthropic | openai | ollama | deepseek"
    )
