from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-4-7"

    database_url: str
    database_url_ro: str

    embeddings_url: str = "http://embeddings:8000"

    data_dir: str = "/data"
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
