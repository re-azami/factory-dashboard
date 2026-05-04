"""
Self-hosted embedding server using BGE-M3.
BGE-M3 is multilingual (strong on Persian/Farsi) and produces 1024-d vectors.

The model is downloaded once to /models (mounted from data/models/ on your disk).
Subsequent container restarts use the cached model — no re-download.

Endpoint:
  POST /embed   {"text": "..."} → {"embedding": [...1024 floats...]}
  GET  /health  → {"status": "ok"}
"""
import os

from fastapi import FastAPI
from pydantic import BaseModel
from FlagEmbedding import BGEM3FlagModel

MODEL_NAME = os.getenv("MODEL_NAME", "BAAI/bge-m3")
MODEL_DIR = os.getenv("MODEL_DIR", "/models")

app = FastAPI(title="Embeddings Service")

# Load model once at startup — this takes ~30 seconds on first run
print(f"Loading embedding model {MODEL_NAME} from {MODEL_DIR} ...")
model = BGEM3FlagModel(MODEL_NAME, use_fp16=True, cache_dir=MODEL_DIR)
print("Embedding model ready.")


class EmbedRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/embed")
def embed(req: EmbedRequest):
    result = model.encode([req.text], batch_size=1, max_length=512)
    vector = result["dense_vecs"][0].tolist()
    return {"embedding": vector}
