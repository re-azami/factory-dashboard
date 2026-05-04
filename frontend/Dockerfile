FROM python:3.11-slim

ENV PIP_INDEX_URL=https://pypi.devneeds.ir/simple/
ENV PIP_TRUSTED_HOST=pypi.devneeds.ir
ENV PIP_DEFAULT_TIMEOUT=300

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
