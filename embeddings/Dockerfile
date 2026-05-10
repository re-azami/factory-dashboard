FROM python:3.11-slim

ENV PIP_DEFAULT_TIMEOUT=600

# Use huggingface.co directly — the devneeds.ir mirror blocks BAAI/bge-m3.
ENV HF_ENDPOINT=https://huggingface.co/

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
