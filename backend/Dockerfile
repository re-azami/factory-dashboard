FROM python:3.11-slim

# Use the local pip mirror (devneeds.ir) — pypi.org is unreliable on this network.
ENV PIP_INDEX_URL=https://pypi.devneeds.ir/simple/
ENV PIP_TRUSTED_HOST=pypi.devneeds.ir
ENV PIP_DEFAULT_TIMEOUT=300

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY migrations/ ./migrations/

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
