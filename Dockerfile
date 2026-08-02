# Use official Playwright Python image pre-configured with Linux dependencies & Chromium
FROM mcr.microsoft.com/playwright/python:v1.49.0-noble

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    USER_DATA_DIR=/app/user_data \
    UPLOAD_DIR=/app/uploads

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir jsonref

# Install Playwright browser binaries
RUN playwright install chromium

# Copy application source code
COPY backend ./backend
COPY .env.example ./.env.example

# Create storage directories
RUN mkdir -p /app/user_data /app/uploads /app/data

EXPOSE 8000

# Run FastAPI app using Uvicorn
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
