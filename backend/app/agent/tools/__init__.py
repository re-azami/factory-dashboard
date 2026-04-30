from app.agent.tools.execute_sql import execute_sql, execute_sql_schema
from app.agent.tools.run_python import run_python, run_python_schema
from app.agent.tools.semantic_search import semantic_search, semantic_search_schema

TOOL_SCHEMAS = [execute_sql_schema, semantic_search_schema, run_python_schema]

TOOL_HANDLERS = {
    "execute_sql": execute_sql,
    "semantic_search": semantic_search,
    "run_python": run_python,
}
