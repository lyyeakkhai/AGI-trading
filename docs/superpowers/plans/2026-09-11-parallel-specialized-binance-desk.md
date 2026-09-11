# Parallel Specialized Agent Implementation Plan: Binance Futures USD-M

**Goal:** Parallelize the deep refinement and perfection of the 4 independent core domains of the Binance Futures USD-M trading desk using specialized Agency Agents.

**Architecture:** 4 concurrent, isolated subagents dispatched in parallel with zero shared file edits:
1. **Agent 1 (`chart_specialist`)**: `FuturesChartPane.tsx` — Advanced candlestick canvas rendering, moving averages (MA7, MA25, MA99), timeframes, and on-chart quick order pill.
2. **Agent 2 (`orderbook_specialist`)**: `OrderBookPanel.tsx` & `TradesPanel.tsx` — High-speed order book depth rendering, tick aggregation, spread calculations, and live trade tape.
3. **Agent 3 (`execution_risk_specialist`)**: `FuturesOrderPanel.tsx` & `AccountMarginCard.tsx` — Margin mode, leverage calculation math (liquidation price, order cost, margin requirement), BBO match, and percentage slider with 5 diamond stops.
4. **Agent 4 (`positions_footer_specialist`)**: `PositionsOrdersTable.tsx` & `BottomTickerStrip.tsx` — Multi-tab order/position management, 15 table columns, empty state illustration, and live scrolling ticker marquee.

## File Boundary Matrix (Zero Conflicts)

| Specialized Agent | Owned Files |
|-------------------|-------------|
| `chart_specialist` | `apps/web/src/features/trading/components/FuturesChartPane.tsx` |
| `orderbook_specialist` | `apps/web/src/features/trading/components/OrderBookPanel.tsx`, `TradesPanel.tsx` |
| `execution_risk_specialist` | `apps/web/src/features/trading/components/FuturesOrderPanel.tsx`, `AccountMarginCard.tsx` |
| `positions_footer_specialist` | `apps/web/src/features/trading/components/PositionsOrdersTable.tsx`, `BottomTickerStrip.tsx` |

---

## Coordinator Integration & Verification
Once all 4 parallel subagents complete, coordinator runs:
1. `cd apps/web && pnpm run typecheck`
2. `cd apps/web && pnpm run lint`
3. `cd apps/web && pnpm run build`
