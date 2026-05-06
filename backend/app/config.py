import os


class Settings:
    # LLM
    llm_provider: str = os.getenv("LLM_PROVIDER", "anthropic")   # anthropic | openai | ollama
    llm_model: str = os.getenv("LLM_MODEL", "claude-sonnet-4-6")

    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434/v1")
    ollama_api_key: str = os.getenv("OLLAMA_API_KEY", "ollama")

    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql+psycopg://factory:factory@db:5432/factory")
    database_url_ro: str = os.getenv("DATABASE_URL_RO", "postgresql+psycopg://factory_ro:factory_ro@db:5432/factory")

    # Embeddings
    embeddings_url: str = os.getenv("EMBEDDINGS_URL", "http://embeddings:8001")

    # Bulk ingest source folder (mounted into the backend container).
    # docker-compose.yml mounts ./data/raw → /data/raw, so the factory subfolder
    # ends up at /data/raw/factory inside the container.
    factory_data_dir: str = os.getenv("FACTORY_DATA_DIR", "/data/raw/factory")


settings = Settings()
