from fastapi import APIRouter, File, UploadFile

from app.ingestion.registry import ingest_file

router = APIRouter()


@router.post("")
async def ingest(file: UploadFile = File(...)) -> dict:
    contents = await file.read()
    result = ingest_file(filename=file.filename or "upload.xlsx", contents=contents)
    return result
