FROM python:3.12-slim

WORKDIR /app
COPY pipeline/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY pipeline/ ./
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8001"]
