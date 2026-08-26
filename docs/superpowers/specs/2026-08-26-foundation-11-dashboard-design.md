# Foundation 11: Command Center Dashboard — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F11 of 13
**Depends on:** F0, F1, F2, F3, F4, F5, F6, F7, F8
**Unlocks:** F12
**Blueprint tasks:** 11.1 – 11.10

---

## 1. Purpose

Foundation 11 delivers the **Command Center**, a single-owner Next.js web application that acts as the mission control for the AGI Trading Platform. 
It provides the visual interface for monitoring the portfolio, viewing the agent's real-time reasoning, inspecting deep research debate logs, and—most critically—**manually approving Trade Proposals**.

This foundation also implements rigorous Owner Authentication (Argon2id + TOTP + HTTP-only Cookies + CSRF protection), ensuring that the API endpoints used to approve trades or trigger the Kill Switch are heavily fortified.

---

## 2. Scope

### In scope
- **Owner Authentication:** Login with `DASHBOARD_AUTH_SECRET`, TOTP verification, signed HTTP-only cookies, and CSRF token generation.
- **Next.js Web App (`apps/web`):** Dark-mode UI with sidebar navigation, strict TypeScript, and Tailwind CSS.
- **WebSocket Streaming (`apps/api` -> `apps/web`):** Real-time pub/sub over WebSockets for live price updates, order fills, and agent logs.
- **Dashboard Pages:**
  - `/` (Overview: Portfolio, Risk, System Health)
  - `/markets/[symbol]` (TradingView Lightweight Charts, indicators)
  - `/agent` (Hermes live logs, TradingAgents debate logs, observations)
  - `/proposals` (Interactive cards with Approve / Reject / Watch buttons and a live TTL countdown)
  - `/system` (Granular health checks, active config, persistent Kill Switch)
- **Observability:** Prometheus + Grafana setup in `docker-compose.yml`.
- **Caddy Proxy:** Routing `/api` to the backend, `/ws` to WebSockets, and `/` to the Next.js app.

### Out of scope
- Financial math in the frontend — the UI is "dumb"; all calculations are done by the API.
- Actual execution on Binance — the "Approve" button just changes the proposal status in the DB (Execution is F12).

---

## 3. Architecture & Components

### 3.1 Authentication Flow
1. User provides `password`. API compares it to `DASHBOARD_AUTH_SECRET` hash.
2. User provides 6-digit TOTP code. API validates it against a securely stored TOTP secret.
3. API issues an HTTP-only, secure, `SameSite=Strict` session cookie, plus a `X-CSRF-Token` header for mutation requests.
4. All owner endpoints (e.g., `POST /api/v1/proposals/{id}/approve`) require this cookie and CSRF token, strictly rejecting `HERMES_SERVICE_TOKEN`.

### 3.2 Frontend (`apps/web`)
- **Framework:** Next.js (App Router).
- **State/Fetching:** React Query or SWR for polling fallback; native WebSocket API for real-time.
- **Charting:** `lightweight-charts` for high-performance canvas-based financial charts.
- **Styling:** Tailwind CSS + Radix/shadcn UI components.

### 3.3 WebSocket Gateway (`apps/api/routers/websocket.py`)
FastAPI WebSocket endpoint that subscribes to Redis Streams (market ticks, order updates, agent logs) and broadcasts them to authenticated frontend clients.

### 3.4 API Updates (`apps/api/routers/owner.py`)
New REST endpoints for the owner:
- `POST /api/v1/owner/auth/login`
- `POST /api/v1/owner/proposals/{id}/approve`
- `POST /api/v1/owner/system/kill-switch`
- `GET /api/v1/owner/metrics`

---

## 4. Acceptance Criteria
- **AC-11.1:** Authentication strictly requires the correct password, a valid TOTP, and issues an HTTP-only cookie.
- **AC-11.2:** WebSocket streams real-time prices and agent events to the browser.
- **AC-11.3 - AC-11.6:** Next.js pages correctly render Portfolio, Markets, Agent state, and Proposals.
- **AC-11.7:** Approving a proposal triggers a call to `/api/v1/owner/proposals/{id}/approve` using CSRF tokens and cookies.
- **AC-11.8:** A persistent Kill Switch toggles system state and immediately halts all processing.
- **AC-11.10:** Caddy routes traffic seamlessly between the Next.js frontend, FastAPI backend, and WebSockets.
