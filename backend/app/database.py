from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings


engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Read-only engine used by the SQL agent tool (SELECT only, cannot DROP or INSERT)
engine_ro = create_engine(settings.database_url_ro)
SessionRO = sessionmaker(autocommit=False, autoflush=False, bind=engine_ro)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create tables and the read-only role on first startup."""
    from app.models import QueryLog  # noqa: F401

    with engine.connect() as conn:
        # Enable pgvector extension (safe to run multiple times)
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

        # Create a read-only role for the agent SQL tool
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'factory_ro') THEN
                    CREATE ROLE factory_ro LOGIN PASSWORD 'factory_ro';
                END IF;
            END
            $$
        """))
        conn.execute(text("GRANT CONNECT ON DATABASE factory TO factory_ro"))
        conn.commit()

    # Create all tables defined in models.py
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        # Grant SELECT on all current and future tables to factory_ro
        conn.execute(text("GRANT USAGE ON SCHEMA public TO factory_ro"))
        conn.execute(text("GRANT SELECT ON ALL TABLES IN SCHEMA public TO factory_ro"))
        conn.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO factory_ro"))
        conn.commit()
