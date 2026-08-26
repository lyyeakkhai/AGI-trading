FROM python:3.12-slim

# Prevent python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE=1
# Prevent python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends     build-essential     && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
RUN uv pip install --system --no-dev -r pyproject.toml

COPY . .

# Failsafe default command
CMD ["python", "-m", "services.hermes.orchestrator"]
