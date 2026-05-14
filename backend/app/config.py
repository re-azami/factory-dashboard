import os


class Settings:
    # LLM provider — deepseek is the default
    llm_provider: str = os.getenv("LLM_PROVIDER", "deepseek")  # anthropic | openai | ollama | deepseek
    # Legacy single-model fallback (still used by ollama)
    llm_model: str = os.getenv("LLM_MODEL", "")

    # Per-provider, per-mode models. Real defaults live in .env.example.
    anthropic_model_simple: str = os.getenv("ANTHROPIC_MODEL_SIMPLE", "")
    anthropic_model_deep:   str = os.getenv("ANTHROPIC_MODEL_DEEP",   "")
    deepseek_model_simple:  str = os.getenv("DEEPSEEK_MODEL_SIMPLE",  "")
    deepseek_model_deep:    str = os.getenv("DEEPSEEK_MODEL_DEEP",    "")
    openai_model_simple:    str = os.getenv("OPENAI_MODEL_SIMPLE",    "")
    openai_model_deep:      str = os.getenv("OPENAI_MODEL_DEEP",      "")

    # Credentials & infrastructure
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    openai_api_key:    str = os.getenv("OPENAI_API_KEY", "")
    deepseek_api_key:  str = os.getenv("DEEPSEEK_API_KEY", "")
    deepseek_base_url: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    ollama_base_url:   str = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434/v1")
    ollama_api_key:    str = os.getenv("OLLAMA_API_KEY", "ollama")

    # Deep-mode reasoning knobs — real defaults in .env.example
    deep_thinking_budget_tokens: int = int(os.getenv("DEEP_THINKING_BUDGET_TOKENS", "0"))
    deep_reasoning_effort: str       = os.getenv("DEEP_REASONING_EFFORT", "")

    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql+psycopg://factory:factory@db:5432/factory")
    database_url_ro: str = os.getenv("DATABASE_URL_RO", "postgresql+psycopg://factory_ro:factory_ro@db:5432/factory")

    # Embeddings
    embeddings_url: str = os.getenv("EMBEDDINGS_URL", "http://embeddings:8001")

    # Bulk ingest source folder (mounted into the backend container).
    # docker-compose.yml mounts ./data/raw → /data/raw, so the factory subfolder
    # ends up at /data/raw/factory inside the container.
    factory_data_dir: str = os.getenv("FACTORY_DATA_DIR", "/data/raw/factory")

    # Seed admin (consumed once by app.auth.seed on startup if the users table is empty)
    admin_username: str = os.getenv("ADMIN_USERNAME", "")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "")

    # JWT — used by app.auth.jwt_tokens. Empty `jwt_secret` raises at first
    # encode/decode call (never at import time, so tests that don't touch
    # auth stay unaffected).
    jwt_secret: str = os.getenv("JWT_SECRET", "")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_minutes: int = int(os.getenv("JWT_ACCESS_TOKEN_MINUTES", "720"))  # 12 h

    # CORS — comma-separated list of allowed frontend origins. Default covers
    # both the Streamlit dev port (:8501) and the Angular SPA (:4200) that
    # runs in parallel during the migration. Production deployments override
    # via env.
    frontend_origin: str = os.getenv(
        "FRONTEND_ORIGIN", "http://localhost:8501,http://localhost:4200"
    )


settings = Settings()
