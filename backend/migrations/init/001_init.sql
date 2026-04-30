-- Bootstrap script: enable pgvector and create the read-only role.
-- Real schema migrations live in alembic.

CREATE EXTENSION IF NOT EXISTS vector;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'factory_ro') THEN
        CREATE ROLE factory_ro LOGIN PASSWORD 'factory_ro';
    END IF;
END$$;

GRANT CONNECT ON DATABASE factory TO factory_ro;
GRANT USAGE ON SCHEMA public TO factory_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO factory_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO factory_ro;
