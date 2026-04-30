from functools import lru_cache

from sqlalchemy import Engine, create_engine

from app.config import get_settings


@lru_cache
def rw_engine() -> Engine:
    return create_engine(get_settings().database_url, pool_pre_ping=True)


@lru_cache
def readonly_engine() -> Engine:
    """SELECT-only role. Used exclusively by the execute_sql agent tool."""
    return create_engine(get_settings().database_url_ro, pool_pre_ping=True)
