# Foundation 7: Hermes Tool APIs, Trading Knowledge, Memory, Skills — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F7 of 13
**Depends on:** F0, F1, F2, F3, F4, F5, F6
**Unlocks:** F8, F10
**Blueprint tasks:** 7.1 – 7.11

---

## 1. Purpose

Foundation 7 is the interface between the deterministic financial backend and the non-deterministic LLM agent ("Hermes"). It exposes all the capabilities built in F1-F6 as strictly authorized REST tool endpoints. It also provisions the `pgvector` knowledge base for semantic trading retrieval and formalizes the file-based skills that guide the agent's behavior. 

Most importantly, F7 acts as a **Security Boundary**. It enforces negative authorization to guarantee that the LLM agent can *never* directly execute trades, change risk rules, or access exchange credentials.

---

## 2. Scope

### In scope
- **Tool APIs:** REST endpoints for market data, analytics, portfolio state, strategy queries, and proposal creation.
- **Negative Authorization:** Strict middleware ensuring `HERMES_SERVICE_TOKEN` cannot perform privileged owner actions.
- **Trading Knowledge Base:** Local text embeddings (using `sentence-transformers`) stored in PostgreSQL `pgvector` for semantic search.
- **Agent Memory:** Endpoints to store and retrieve qualitative observations.
- **Procedural Skills:** `skills/trading/` directory with `SKILL.md` instructions and `rules.yaml`, plus the Trader Constitution.
- **Hermes Tools SDK:** Python client bindings (`packages/hermes_tools/`) that generate OpenAPI tool schemas.

### Out of scope
- The actual execution of the LLM prompt loop (F8).
- The TradingAgents multi-agent framework (F10).

---

## 3. Architecture & Components

### 3.1 Authorization Middleware (`apps/api/middleware.py` or dependencies)
A FastAPI dependency `verify_service_token` that requires a valid `X-Service-Token`.
Routes are explicitly segmented into:
- `/api/v1/tools/*` (Hermes allowed, TradingAgents partially allowed)
- `/api/v1/owner/*` (Strictly cookie/session-based, blocks all service tokens)

### 3.2 Tool Endpoints (`apps/api/routers/tools.py`)
These are thin wrappers over existing services, formatted for LLM consumption.
- `market.get_price`, `analytics.get_indicators`
- `portfolio.get_positions`
- `proposal.create`: Validates intent, derives idempotency key, runs proposal-time risk check (F4), and saves to DB. 

### 3.3 Trading Knowledge & Memory (`services/knowledge/`, `packages/database/models/knowledge.py`)
- **pgvector Integration:** A table `trading_knowledge_embeddings` storing chunked documents and 384-dimensional vectors.
- **Local Embedding Model:** Uses `sentence-transformers` (`all-MiniLM-L6-v2`) locally to compute embeddings without API costs or privacy risks.
- **Memory Table:** `agent_observations` stores text reflections linked to symbols/times.

### 3.4 Skill System (`skills/trading/`)
A file-system based repository of markdown instructions that Hermes reads to understand how to apply strategies (e.g., `skills/trading/breakout/SKILL.md`).

### 3.5 Core Isolation Proof
The system is explicitly designed so that if Hermes crashes, the quantitative workers (F5) and market data ingest (F2) continue running perfectly.

---

## 4. Acceptance Criteria
- **AC-7.1**: Service token authentication verifies `HERMES_SERVICE_TOKEN`.
- **AC-7.2**: Hermes token is authorized for tools but receives HTTP 403 for approval/execution routes.
- **AC-7.3**: TradingAgents token is restricted to read-only market/analytics.
- **AC-7.4 - AC-7.5**: Tool endpoints return structured JSON.
- **AC-7.6**: `proposal.create` handles idempotency and proposal-time risk.
- **AC-7.7**: Proposals cannot be approved by service tokens.
- **AC-7.8**: Skills directory is populated with SKILL.md files and the Trader Constitution.
- **AC-7.9**: pgvector ingestion and retrieval works using local sentence-transformers.
- **AC-7.10**: Trade observations are stored in PostgreSQL.
- **AC-7.11**: `packages/hermes_tools/` exposes typed tool schemas.
- **AC-7.13**: Financial core operates completely independently of the Hermes runtime.
- **AC-7.14**: Security test suite proves negative authorization paths.
