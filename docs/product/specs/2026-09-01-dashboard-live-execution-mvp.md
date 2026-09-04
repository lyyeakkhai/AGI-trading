# Dashboard # Dashboard & Live Execution MVP Live Execution MVP

**Status**: Accepted

## Context
We are upgrading the foundational trading bot architecture into a live execution system with an interactive "Trading Floor" UI. Currently, the system lacks live exchange connectivity and visibility into the multi-agent reasoning process. This epic delivers the MVP of live Binance execution with a Next.js dashboard that streams AI agent debates in real-time, secured by a panic Kill Switch.

## Current State
- The foundational AI agent logic exists, but execution is limited to `services/execution/paper.py`.
- The FastAPI backend (`apps/api/`) and Next.js 14 frontend (`apps/web/`) skeletons are present but disconnected.
- There is no database lock mechanism for emergency trade cancellation.

## Proposed Change
Implement the `live.py` Binance adapter using `ccxt`, build the Next.js interactive dashboard to stream agent reasoning via native WebSockets, and build a "God Mode" Kill Switch secured by a Postgres transaction.

### Implementation Details
- **Binance Adapter**: Use the async `ccxt` library in `services/execution/live.py`.
- **Trading Architecture**: Synchronous AI Gating in `services/execution/approvals.py`. The trading loop waits for the AIs (Bull, Bear, Tech) to reach consensus before executing. Inference calls have a strict 10-second timeout and 3-strike exponential backoff for rate limits.
- **WebSocket Contract**: FastAPI streams `{"type": "agent_reasoning", "agent": "bull|bear|tech", "timestamp": "...", "content": "...", "is_final": false}`. Next.js consumes this via native `WebSocket`.
- **Auth**: Single admin user. The Next.js frontend sends a static password (from `.env`) to FastAPI, which returns a JWT stored in an HTTP-only secure cookie.
- **Kill Switch Idempotency**: Create a `kill_switch_locks` Postgres table. Schema: `id (UUID), triggered_at (TIMESTAMP), status (VARCHAR), executed_by (VARCHAR)`. The Kill Switch uses market orders to instantly exit positions.
- **Explanation Endpoint**: `GET /api/trades/{id}/explanation` will query the database for the serialized consensus output of the 3 agents for a specific trade ID and return it as JSON.
- **Environment Variables**: `BINANCE_API_KEY`, `BINANCE_API_SECRET`, `ADMIN_PASSWORD`, `JWT_SECRET`, `DATABASE_URL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.
- **Security**: Prompt injection is accepted as a risk for MVP 1.

## Acceptance Criteria
1. `POST /api/auth` issues a valid JWT set as an HTTP-only cookie.
2. The Next.js dashboard displays the current portfolio balance and active positions fetched from Binance via `ccxt`.
3. The WebSocket endpoint successfully streams simulated or real multi-agent reasoning to the UI.
4. Clicking the "Kill Switch" immediately cancels all open orders and submits Market Orders to close positions.
5. Double-clicking the Kill Switch does not result in duplicate API calls to Binance (prevented by `kill_switch_locks` table).
6. "Explain This Trade" button correctly fetches consensus reasoning from `GET /api/trades/{id}/explanation`.
7. **Mandatory**: A 24-hour testnet validation phase passes successfully (defined as: at least 5 testnet trades executed automatically without unhandled exceptions or connection drops) before Mainnet credentials are added to `.env`.

## Testing Plan
| Layer       | What                     | Count |
|-------------|--------------------------|-------|
| Unit        | `live.py` ccxt adapter mocks | +5 |
| Unit        | AI Timeout and Rate Limit Backoff logic | +3 |
| Integration | Postgres `kill_switch_locks` idempotency | +2 |
| E2E         | Login -> View Dashboard -> Hit Kill Switch (Testnet) | +1 |

## Rollback Plan
If the UI or execution adapter fails in production, remove Mainnet API keys from `.env` and restart the services to immediately revert to a harmless/disconnected state.

## Effort Breakdown
- Backend Execution (`live.py` + ccxt): 3h
- FastAPI Endpoints & WebSockets: 3h
- Postgres Lock Migration: 1h
- Next.js Auth & Dashboard UI: 4h
- **Total Estimated Effort**: ~11h

## Files Reference
| File | Change |
|------|--------|
| `services/execution/live.py` | Create async ccxt adapter |
| `services/execution/approvals.py` | Add sync AI gating with 10s timeout |
| `apps/api/routers/trading.py` | Add kill switch, portfolio, and explanation REST endpoints |
| `apps/api/routers/ws.py` | Create WebSocket endpoint for agent reasoning |
| `apps/web/src/app/page.tsx` | Build main dashboard UI and native WebSocket connection |
| `migrations/..._kill_switch_locks.py` | Create alembic migration for new table |

## Out of Scope
- Mobile responsive views.
- Retro arcade UI/Sound effects.
- Complex sandboxing for Prompt Injection.
- Background worker queues (using Synchronous AI Gating instead).
