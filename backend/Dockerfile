# Multi-stage Dockerfile for Manovriddhi AI Backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for imaging & fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Initialize and seed database if not already present
RUN python seed_data.py

EXPOSE 8000

ENV PORT=8000
ENV HOST=0.0.0.0

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
