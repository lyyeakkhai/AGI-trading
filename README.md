# AI Trading Intelligence Platform

A private, single-user AI trading intelligence and execution platform.

## Prerequisites

- Python 3.12+
- uv
- Node.js LTS + pnpm
- Docker + Docker Compose

## Bootstrap

```bash
cp .env.example .env
uv sync
pnpm install
docker compose up -d
uv run alembic upgrade head
```

## Development Commands

```bash
make lint        # ruff lint + format check + frontend lint
make typecheck   # mypy strict + tsc
make test        # pytest
make check       # all of the above
make up          # start Docker services
make migrate     # run Alembic migrations
```

## Architecture

See [Foundation 0 Specification](docs/specs/0001-foundation-0-repository-tooling-configuration/index.md) and [Product Requirements Document](docs/product/prd.md).
