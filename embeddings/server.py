"""BGE-M3 dense embedding server.

Loads the model once at startup and exposes POST /embed. Kept deliberately
small — colocated with no other logic so it can be swapped or scaled
independently of the API.
"""

import os

from fastapi import FastAPI
from pydantic import BaseModel

MODEL_NAME = os.getenv("MODEL_NAME", "BAAI/bge-m3")

app = FastAPI(title="BGE-M3 Embeddings")
_model = None


def _get_model():
    global _model
    if _model is None:
        from FlagEmbedding import BGEM3FlagModel
        _model = BGEM3FlagModel(MODEL_NAME, use_fp16=False)
    return _model


class EmbedRequest(BaseModel):
    texts: list[str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/embed")
def embed(req: EmbedRequest) -> dict[str, list[list[float]]]:
    output = _get_model().encode(req.texts, return_dense=True)["dense_vecs"]
    return {"embeddings": [vec.tolist() for vec in output]}
