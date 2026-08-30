# Foundation 11: Command Center Dashboard — Implementation Plan

**Foundation:** F11
**Spec:** `docs/superpowers/specs/2026-08-26-foundation-11-dashboard-design.md`
**Branch:** `feat/foundation-11-dashboard`

---

## Task 11.1: Authentication & Security
- Add `argon2-cffi`, `pyotp`, and `itsdangerous` to `pyproject.toml` (core).
- Create `packages/auth/`. Implement password hashing, TOTP validation, and cookie signing.
- In `apps/api/routers/auth.py`, create `/login`, `/logout`, and `/totp/setup`.
- In `apps/api/dependencies.py`, implement `verify_owner_session` which reads the signed cookie and validates the CSRF token on `POST`/`PUT`/`DELETE` requests.

## Task 11.2: Owner API Routes
- Create `apps/api/routers/owner.py`.
- Move or expose `portfolio`, `proposals`, `system/health`, and `system/kill-switch` behind `verify_owner_session`.
- Specifically, implement `POST /api/v1/owner/proposals/{id}/approve` which updates a proposal's status in the DB (checking that `TTL` hasn't expired!).

## Task 11.3: WebSocket Gateway
- Create `apps/api/routers/websocket.py`.
- Expose `ws://.../api/v1/ws/stream`. Validate the session cookie before upgrading the connection.
- Forward events from Redis Streams (`market.tick`, `agent.log`, `proposal.new`) to connected WebSocket clients.

## Task 11.4: Next.js Setup & Auth Pages
- In `apps/web/`, ensure Tailwind and necessary UI components are installed.
- Create `/login` page with Password and TOTP fields.
- Create an Auth Context provider that handles the session cookie and CSRF token injection in API requests.

## Task 11.5: Dashboard Shell & Overview Page
- Create the layout with a Sidebar (Overview, Markets, Agent, Proposals, System) and a top Header showing `APP_ENV`, `TRADING_MODE`, and a glowing Kill Switch button.
- Create the `/` (Overview) page to fetch and display portfolio balance, open positions, and risk metrics via React Query.

## Task 11.6: Markets & Charts Page
- Install `lightweight-charts` in `apps/web`.
- Create `/markets/[symbol]` page. Fetch historical candles from `/api/v1/owner/market/candles` and stream live updates via WebSocket.
- Plot the candlestick chart and optionally overlay technical indicators.

## Task 11.7: Proposals & Agent Page
- Create `/proposals` page. List all `PENDING_APPROVAL` proposals.
- Display a countdown timer based on `approval_ttl_seconds`.
- Add an "Approve" button that sends `POST /api/v1/owner/proposals/{id}/approve`.
- Create `/agent` page. Subscribe to the agent's live logs and memory via WebSocket, displaying a scrolling terminal-like feed.

## Task 11.8: Docker & Proxy Wiring
- Update `infrastructure/docker/web.Dockerfile` for the Next.js app (using `pnpm build` and `pnpm start`).
- Update `docker-compose.yml` to include the `web` container.
- Update `infrastructure/caddy/Caddyfile` to properly reverse proxy `/api` and `/ws` to the `api` container, and the rest to the `web` container.
