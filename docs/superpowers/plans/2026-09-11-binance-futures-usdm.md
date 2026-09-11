# Binance Futures USD-M Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an exact pixel-perfect replica of the Binance Futures USD-M (`BTCUSDT Perp`) trading desk on `/trade`, matching every button, label, control, and metric from the reference screenshot.

**Architecture:** A feature-encapsulated modular hierarchy inside `apps/web/src/features/trading/components/` following `apps/web/AGENTS.md`. A centralized WebSocket and reactive state hook (`useBinanceFuturesWs`) powers live and simulated market data, order book depth, trades stream, and 24h metrics across 9 dedicated visual zones.

**Tech Stack:** Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Lightweight Charts.

## Global Constraints

- Follow `apps/web/AGENTS.md`: all components reside in `apps/web/src/features/trading/components/` with explicit exports in `index.ts`.
- Adhere strictly to `DESIGN.md`: IBM Plex Sans for interface text and JetBrains Mono for all numeric values, prices, timestamps, and percentages.
- Exact Binance color tokens: Canvas `#12161A`, Panels `#181A20`, Borders `#23272E` / `#2B313A`, Brand `#F0B90B`, Long `#0ECB81`, Short `#F6465D`.
- Viewport fit: 100vh fixed desktop desk with zero vertical or horizontal page overflow.

---

### Task 1: Domain Types & Real-Time Market Data Hook

**Files:**
- Create: `apps/web/src/features/trading/types/binanceFutures.ts`
- Create: `apps/web/src/features/trading/hooks/useBinanceFuturesWs.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface OrderBookRow {
    price: number;
    size: number;
    sum: number;
    depthPercent: number;
  }
  export interface TradeRecord {
    id: string;
    price: number;
    amount: number;
    time: string;
    side: "buy" | "sell";
  }
  export interface FuturesTickerStats {
    symbol: string;
    lastPrice: number;
    priceChange: number;
    priceChangePercent: number;
    markPrice: number;
    indexPrice: number;
    fundingRate: number;
    countdownFormatted: string;
    high24h: number;
    low24h: number;
    volumeBtc: number;
    volumeUsdt: number;
    openInterestUsdt: number;
  }
  export function useBinanceFuturesWs(symbol?: string): {
    ticker: FuturesTickerStats;
    asks: OrderBookRow[];
    bids: OrderBookRow[];
    trades: TradeRecord[];
    connectionStatus: "connected" | "connecting" | "disconnected";
  };
  ```

- [ ] **Step 1: Write domain TypeScript interfaces**
Define all types for order book, trades, ticker stats, leverage/margin settings, and market tickers in `apps/web/src/features/trading/types/binanceFutures.ts`.

- [ ] **Step 2: Implement `useBinanceFuturesWs`**
Implement the hook in `apps/web/src/features/trading/hooks/useBinanceFuturesWs.ts` with public Binance WebSocket connection (`wss://fstream.binance.com/ws/...`) and automatic fallback simulation for resilient offline/dev operation.

- [ ] **Step 3: Verify TypeScript compilation**
Run `cd apps/web && pnpm run typecheck` to verify zero type errors.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/features/trading/types/binanceFutures.ts apps/web/src/features/trading/hooks/useBinanceFuturesWs.ts
git commit -m "feat(trading): add Binance Futures domain types and real-time hook"
```

---

### Task 2: Binance Futures Top Header & Market Stats Ticker Bar

**Files:**
- Create: `apps/web/src/features/trading/components/BinanceFuturesHeader.tsx`
- Create: `apps/web/src/features/trading/components/MarketStatsTickerBar.tsx`

**Interfaces:**
- Consumes: `FuturesTickerStats` from `useBinanceFuturesWs`.
- Produces: `<BinanceFuturesHeader />` and `<MarketStatsTickerBar ticker={ticker} />`.

- [ ] **Step 1: Implement `BinanceFuturesHeader`**
Create the 48px top bar with the Binance diamond logo, navigation links (`Futures ▾`, `Options ▾`, `Trading Bots ▾`, `Copy Trading`, `Smart Money`, `Campaigns ▾`, `Data ▾`, `More ▾`), and right utility buttons (profile, wallet, orders, layout, globe, support, bell, settings).

- [ ] **Step 2: Implement `MarketStatsTickerBar`**
Create the 42px stats bar with star toggle, BTC icon, `BTCUSDT Perp ▾`, large green price (`77,841.9`), 24h change (`+870.0 +1.13%`), Mark (`77,829.3`), Index (`77,835.5`), Funding rate countdown (`0.00558% / 02:17:26`), 24h High (`78,115.4`), 24h Low (`76,000.3`), 24h Vol(BTC), 24h Vol(USDT), Open Interest, and right layout/options icons.

- [ ] **Step 3: Verify build**
Run `cd apps/web && pnpm run typecheck`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/features/trading/components/BinanceFuturesHeader.tsx apps/web/src/features/trading/components/MarketStatsTickerBar.tsx
git commit -m "feat(trading): add BinanceFuturesHeader and MarketStatsTickerBar components"
```

---

### Task 3: Candlestick & Volume Chart with Floating In-Chart Order Pill

**Files:**
- Create: `apps/web/src/features/trading/components/FuturesChartPane.tsx`

**Interfaces:**
- Consumes: `CandleData` from `@/lib/mockMarketData`, `ticker` from `useBinanceFuturesWs`.
- Produces: `<FuturesChartPane symbol="BTCUSDT" currentPrice={ticker.lastPrice} />`.

- [ ] **Step 1: Implement `FuturesChartPane`**
Integrate `lightweight-charts` with dark Binance theme `#12161A`, candlestick series, MA7 (yellow `#F0B90B`), MA25 (pink `#E040FB`), MA99 (purple `#7C4DFF`), and volume histogram.
Include the top chart toolbar with sub-tabs (`Chart`, `Info`, `Data`), timeframe buttons (`Time`, `1s`, `15m`, `1h`, `4h`, `1D`, `1W`), view switches (`Original`, `Trading View`, `Depth`), indicators button, and screenshot/fullscreen buttons.

- [ ] **Step 2: Add Floating In-Chart Quick-Order Pill**
Render the pill in the upper-left chart canvas with `Buy/Long 77,842.00` (green), `Size (USDT)` input, `Sell/Short 77,841.90` (red), and close `✕` button.

- [ ] **Step 3: Verify build**
Run `cd apps/web && pnpm run typecheck`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/features/trading/components/FuturesChartPane.tsx
git commit -m "feat(trading): add FuturesChartPane with floating order pill and moving averages"
```

---

### Task 4: Order Book & Real-Time Trades Stream Panels

**Files:**
- Create: `apps/web/src/features/trading/components/OrderBookPanel.tsx`
- Create: `apps/web/src/features/trading/components/TradesPanel.tsx`

**Interfaces:**
- Consumes: `asks`, `bids`, `trades`, `ticker` from `useBinanceFuturesWs`.
- Produces: `<OrderBookPanel asks={asks} bids={bids} currentPrice={ticker.lastPrice} markPrice={ticker.markPrice} />` and `<TradesPanel trades={trades} />`.

- [ ] **Step 1: Implement `OrderBookPanel`**
Create the order book with header layout toggles (both, asks only, bids only), precision dropdown (`0.1 ▾`), table columns (`Price (USDT)`, `Size (USDT)`, `Sum (USDT)`), red ask rows with depth bars, center spread row (`77,841.9 ↑ 77,829.3`), and green bid rows with depth bars.

- [ ] **Step 2: Implement `TradesPanel`**
Create the trades panel with tabs for `Trades` and `Top Movers`, columns (`Price (USDT)`, `Amount (USDT)`, `Time`), and streaming animated trade entries.

- [ ] **Step 3: Verify build**
Run `cd apps/web && pnpm run typecheck`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/features/trading/components/OrderBookPanel.tsx apps/web/src/features/trading/components/TradesPanel.tsx
git commit -m "feat(trading): add OrderBookPanel and TradesPanel components"
```

---

### Task 5: Futures Order Execution Form & Account Margin Risk Card

**Files:**
- Create: `apps/web/src/features/trading/components/FuturesOrderPanel.tsx`
- Create: `apps/web/src/features/trading/components/AccountMarginCard.tsx`

**Interfaces:**
- Consumes: `ticker` from `useBinanceFuturesWs`, `useTradingPlan`.
- Produces: `<FuturesOrderPanel currentPrice={ticker.lastPrice} />` and `<AccountMarginCard />`.

- [ ] **Step 1: Implement `FuturesOrderPanel`**
Build the order execution panel:
- Margin mode button (`Cross`) with modal.
- Leverage multiplier button (`5x`) with 1x–125x adjustment slider.
- Single-Asset mode indicator (`S`).
- Order type tabs (`Limit`, `Market`, `Conditional`).
- `Avbl 0.00 USDT` with transfer icon.
- Price input with `BBO` button.
- Size input with `USDT` / `BTC` toggle.
- Percentage slider with 5 diamond stop markers (`0%`, `25%`, `50%`, `75%`, `100%`).
- `TP/SL` and `Reduce-Only` checkboxes, `TIF GTC` badge.
- Dual action buttons: `Buy/Long` and `Sell/Short`.
- Risk summary: `Liq Price`, `Cost`, `Max`.
- `% Fee level` link and `Finish Quiz to Get Started` card button.

- [ ] **Step 2: Implement `AccountMarginCard`**
Build the account panel:
- `Account` header with `⇄ Switch`.
- Circular `Margin Ratio` gauge at `0.00%`.
- `Maintenance Margin: 0.0000 USDT` and `Margin Balance: 0.0000 USDT`.
- `Single-Asset Mode` button.
- Warning notice card: *"To start trading, please transfer assets to your Futures account."* with `Transfer`, `Buy Crypto`, and `Swap` buttons.

- [ ] **Step 3: Verify build**
Run `cd apps/web && pnpm run typecheck`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/features/trading/components/FuturesOrderPanel.tsx apps/web/src/features/trading/components/AccountMarginCard.tsx
git commit -m "feat(trading): add FuturesOrderPanel and AccountMarginCard components"
```

---

### Task 6: Positions & Orders Table and Bottom Ticker Strip

**Files:**
- Create: `apps/web/src/features/trading/components/PositionsOrdersTable.tsx`
- Create: `apps/web/src/features/trading/components/BottomTickerStrip.tsx`

**Interfaces:**
- Consumes: Connection status from `useBinanceFuturesWs`.
- Produces: `<PositionsOrdersTable />` and `<BottomTickerStrip connectionStatus={connectionStatus} />`.

- [ ] **Step 1: Implement `PositionsOrdersTable`**
Create the bottom table with tabs (`Positions(0)`, `Open Orders(0)`, `Order History`, `Trade History`, `Transaction History`, `Position History`, `Bots`, `Assets`), `Hide Other Symbols` checkbox, 15 table header columns, and empty state document graphic with *"You have no position."*

- [ ] **Step 2: Implement `BottomTickerStrip`**
Create the 26px footer strip with green `Stable connection` dot, real-time scrolling marquee with crypto pairs (`RAYSOLUSDT +24.33%`, `MARSCOINUSDT +18.64%`, `BTCUSDT +1.12%`, `SAGAUSDT +7.17%`, `ZECUSDT -1.10%`, `IOSTUSDT -14.54%`, `VTHOUSDT -5...`), and footer links (`Campaign Center`, `Announcements`, `Disclaimer`, `Futures Chatroom`, `Cookie Preferences`).

- [ ] **Step 3: Verify build**
Run `cd apps/web && pnpm run typecheck`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/features/trading/components/PositionsOrdersTable.tsx apps/web/src/features/trading/components/BottomTickerStrip.tsx
git commit -m "feat(trading): add PositionsOrdersTable and BottomTickerStrip components"
```

---

### Task 7: Master Desk Coordinator & Route Integration

**Files:**
- Create: `apps/web/src/features/trading/components/BinanceFuturesDesk.tsx`
- Modify: `apps/web/src/features/trading/components/index.ts`
- Modify: `apps/web/src/app/trade/page.tsx`

**Interfaces:**
- Produces: `<BinanceFuturesDesk />` mounted on `/trade`.

- [ ] **Step 1: Compose `BinanceFuturesDesk`**
Assemble all 9 components into the responsive 100vh master grid.

- [ ] **Step 2: Export in `index.ts`**
Add all new components to `apps/web/src/features/trading/components/index.ts`.

- [ ] **Step 3: Update `apps/web/src/app/trade/page.tsx`**
Render `<BinanceFuturesDesk />` inside full-bleed layout.

- [ ] **Step 4: Verify build**
Run `cd apps/web && pnpm run typecheck && pnpm run lint`.

- [ ] **Step 5: Commit**
```bash
git add apps/web/src/features/trading/components/BinanceFuturesDesk.tsx apps/web/src/features/trading/components/index.ts apps/web/src/app/trade/page.tsx
git commit -m "feat(trading): integrate BinanceFuturesDesk on /trade route"
```

---

### Task 8: End-to-End Verification & Visual Fidelity Inspection

**Files:**
- Verify across all created files.

- [ ] **Step 1: Execute full TypeScript and Lint verification**
Run:
```bash
cd apps/web && pnpm run typecheck && pnpm run lint
```
Expected: PASS with 0 errors.

- [ ] **Step 2: Verify visual parity against reference image**
Check every button, label, input, slider, depth bar, and ticker element.

- [ ] **Step 3: Commit any final refinements**
```bash
git commit -m "chore(trading): complete Binance Futures USD-M visual alignment and verification"
```
