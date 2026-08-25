.PHONY: bootstrap up lint typecheck test check migrate drift-check

bootstrap:  ## Full local setup from scratch
	cp .env.example .env 2>/dev/null || true
	uv sync
	pnpm install
	docker compose up -d
	uv run alembic upgrade head

up:         ## Start Docker services
	docker compose up -d

lint:       ## Python lint + format check + frontend lint
	uv run ruff check .
	uv run ruff format --check .
	pnpm --filter web lint

typecheck:  ## Python mypy strict + frontend tsc
	uv run mypy packages/config packages/logging packages/database apps/api --strict
	pnpm --filter web tsc --noEmit

test:       ## Run all tests
	uv run pytest tests/ -v --cov=packages --cov=apps

check:      ## lint + typecheck + test
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test

migrate:    ## Run Alembic migrations
	uv run alembic upgrade head

drift-check: ## Check for model/migration drift
	uv run alembic check
