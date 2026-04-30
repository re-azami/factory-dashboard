"""Thin client for the self-hosted BGE-M3 embeddings service."""

import httpx

from app.config import get_settings


def embed_text(text: str) -> list[float]:
    return embed_batch([text])[0]


def embed_batch(texts: list[str]) -> list[list[float]]:
    url = get_settings().embeddings_url.rstrip("/") + "/embed"
    resp = httpx.post(url, json={"texts": texts}, timeout=60)
    resp.raise_for_status()
    return resp.json()["embeddings"]
