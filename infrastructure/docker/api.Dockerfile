FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/root/.local/bin:$PATH"

# Install curl to fetch uv
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -LsSf https://astral.sh/uv/install.sh | sh && \
    apt-get purge -y --auto-remove curl && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency definition files
COPY pyproject.toml uv.lock ./

# Install python dependencies
RUN uv sync --frozen --no-dev

# Copy application and packages
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY migrations/ ./migrations/
COPY alembic.ini ./alembic.ini

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
