from app.config import settings


def get_llm_client():
    """Return the right LLM client based on LLM_PROVIDER env var."""
    if settings.llm_provider == "anthropic":
        from app.llm.claude import ClaudeClient
        return ClaudeClient()
    elif settings.llm_provider in ("openai", "ollama"):
        from app.llm.openai_compat import OpenAICompatClient
        return OpenAICompatClient()
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {settings.llm_provider!r}. Choose: anthropic | openai | ollama")
