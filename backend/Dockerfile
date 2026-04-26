FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install native dependencies required by some python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution and installation
RUN pip install uv

# Copy requirements
COPY backend/requirements.txt /app/requirements.txt

# Install dependencies using uv directly into system
RUN uv pip install --system --no-cache -r requirements.txt

# Copy source code
COPY . /app

# Add PYTHONPATH
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
