from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.agent.loop import run_agent_stream

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


@router.post("")
async def chat(req: ChatRequest) -> StreamingResponse:
    return StreamingResponse(
        run_agent_stream(req.message, req.conversation_id),
        media_type="text/event-stream",
    )
