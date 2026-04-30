from fastapi import APIRouter

router = APIRouter()


@router.get("/schema-docs")
def list_schema_docs() -> dict:
    """Week 4: edit per-column descriptions used in the agent's system prompt."""
    return {"docs": []}
