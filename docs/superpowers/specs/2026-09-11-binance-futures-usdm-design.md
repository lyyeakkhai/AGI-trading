# Design Specification: Binance Futures USD-M Trading Interface

**Date:** 2026-09-11  
**Author:** Frontend Developer (Agency Agents)  
**Status:** Approved by User  
**Target Path:** `apps/web/src/features/trading/` & `apps/web/src/app/trade/page.tsx`

---

## 1. Executive Summary & Vision

The objective is to implement an exact, pixel-perfect replica of the **Binance Futures USD-M (`BTCUSDT Perp`)** trading desk interface on the `/trade` route. The desk replaces the current minimal layout with a professional, high-density multi-panel trading terminal that includes:
1. An authentic Binance Futures navigation header with full menu hierarchies and user utilities.
2. A comprehensive 24h market statistics ticker bar (`BTCUSDT Perp`, Mark, Index, Funding rate countdown, 24h High/Low/Volume, Open Interest).
3. A multi-engine candlestick chart area featuring timeframes (`1s`, `15m`, `1h`, `4h`, `1D`, `1W`), technical moving averages (MA7, MA25, MA99), volume histogram, and an embedded in-chart quick-order pill widget.
4. An interactive Order Book with live depth bars, tick-size aggregation (`0.1`), and dynamic spread display.
5. A live real-time Trades stream and Top Movers tab.
6. A complete Futures Order Execution Panel supporting Margin mode (`Cross`/`Isolated`), Leverage multiplier (`5x`), Order types (`Limit`, `Market`, `Conditional`), `BBO` pricing, percentage slider with 5 milestone diamond markers (`0%`, `25%`, `50%`, `75%`, `100%`), dual `Buy/Long` and `Sell/Short` action buttons, and live risk metrics.
7. An Account Margin Ratio gauge and asset management card with deposit/transfer callouts.
8. A bottom tabbed Positions & Orders table (`Positions(0)`, `Open Orders(0)`, `Order History`, `Trade History`, etc.) with the empty state illustration.
9. A bottom status & scrolling marquee ticker strip with connection health and footer shortcuts.

---

## 2. Visual Identity & Design System Compliance

In accordance with `DESIGN.md` and the reference visual:
- **Typography:**
  - Interface elements, tabs, navigation, and badges use **IBM Plex Sans**.
  - All numerical values, prices, volumes, timestamps, tickers, and percentages use **JetBrains Mono** for tabular precision.
- **Color Palette:**
  - **Canvas Base:** `#12161A`
  - **Panels & Card Surfaces:** `#181A20`
  - **Elevated Interactive Surfaces:** `#1E2329` / `#2B313A`
  - **Borders & Dividers:** `#23272E` (subtle `1px` hairlines)
  - **Primary Brand Accent:** `#F0B90B` (Binance Yellow)
  - **Bullish / Profit / Buy:** `#0ECB81` (Emerald Green)
  - **Bearish / Loss / Sell:** `#F6465D` (Ruby Red)
  - **Primary Text:** `#EAECEF`
  - **Muted / Secondary Text:** `#848E9C`
- **Spacing & Radii:**
  - Compact `2px` to `4px` border radius (`rounded-sm`).
  - Strict 0-margin viewport fit with internal scroll containers for individual panels.

---

## 3. Component Architecture & File Layout

Following the feature-encapsulated rules in `apps/web/AGENTS.md`, all new components reside strictly inside `apps/web/src/features/trading/components/`:

```
apps/web/src/features/trading/
├── components/
│   ├── BinanceFuturesHeader.tsx        # Top navigation & system utility icons
│   ├── MarketStatsTickerBar.tsx        # 24h stats, mark/index price, funding countdown
│   ├── FuturesChartPane.tsx            # Candlestick + MA + Volume + on-chart order pill
│   ├── OrderBookPanel.tsx              # Asks/Bids with depth bars & spread indicator
│   ├── TradesPanel.tsx                 # Live trade stream & Top Movers tabs
│   ├── FuturesOrderPanel.tsx           # Margin/leverage controls, order form, dual action buttons
│   ├── AccountMarginCard.tsx           # Margin ratio gauge, balances, transfer callout
│   ├── PositionsOrdersTable.tsx        # Bottom tabbed table for positions & history
│   ├── BottomTickerStrip.tsx           # Connection health & scrolling crypto pairs marquee
│   ├── BinanceFuturesDesk.tsx          # Master coordinator composing all panels
│   └── index.ts                        # Barrel exports
├── hooks/
│   ├── useBinanceFuturesWs.ts          # Public WebSocket & simulated fallback ticker/book feed
│   └── useTradingPlan.ts               # Existing trading execution plan hook
└── types/
    └── binanceFutures.ts               # Domain types for book, trades, and market metrics
```

---

## 4. Detailed Component Specifications

### 4.1 `BinanceFuturesHeader`
- **Height:** 48px fixed.
- **Left:** Binance Futures golden diamond emblem and logo text, followed by navigation dropdown links: `Futures ▾`, `Options ▾`, `Trading Bots ▾`, `Copy Trading`, `Smart Money`, `Campaigns ▾`, `Data ▾`, `More ▾`.
- **Right:** Avatar profile icon, Wallet icon, Order book icon, Multi-panel layout toggle, Language globe, Support headphones, Notification bell, and Settings gear.

### 4.2 `MarketStatsTickerBar`
- **Height:** 42px fixed.
- **Left:** Yellow favorites star, BTC coin badge, `BTCUSDT Perp ▾` selector dropdown.
- **Metrics Strip:**
  - Last Price: Large green `77,841.9` with `+870.0 +1.13%`.
  - `Mark`: `77,829.3` | `Index`: `77,835.5`.
  - `Funding (8h) / Countdown`: `0.00558% / 02:17:26` (with live second countdown).
  - `24h High`: `78,115.4` | `24h Low`: `76,000.3`.
  - `24h Vol(BTC)`: `147,438.639` | `24h Vol(USDT)`: `11,367,549,926.40`.
  - `Open Interest(USDT)`: `8,239,420,736.40`.
- **Right:** Layout configurator icon and options menu (`...`).

### 4.3 `FuturesChartPane`
- **Top Toolbar:** Sub-tabs `Chart`, `Info`, `Data`; Timeframe selectors `Time`, `1s`, `15m`, `1h`, `4h`, `1D`, `1W`, `▾`; display mode toggles `Original`, `Trading View`, `Depth`; indicators and fullscreen toggles.
- **Floating On-Chart Order Pill:** Positioned in the upper-left of the chart canvas with `Buy/Long 77,842.00` (green), `Size (USDT)` input, `Sell/Short 77,841.90` (red), and close `✕`.
- **Canvas Rendering:** Uses `lightweight-charts` with styled dark theme `#12161A`, candlestick series, 3 moving averages (MA7 yellow, MA25 pink, MA99 purple), and bottom volume histogram bars.

### 4.4 `OrderBookPanel` & `TradesPanel`
- **Order Book:** Top header with 3 layout toggles (both, asks only, bids only), precision grouping dropdown `0.1`, table columns `Price (USDT)`, `Size (USDT)`, `Sum (USDT)`. Red asks with depth shading, center spread row (`77,841.9 ↑ 77,829.3`), and green bids with depth shading.
- **Trades Stream:** Tabs for `Trades` and `Top Movers`, columns `Price (USDT)`, `Amount (USDT)`, `Time`. Real-time stream of incoming trades with color-coded prices.

### 4.5 `FuturesOrderPanel` & `AccountMarginCard`
- **Margin & Leverage:** Buttons for `Cross` (opens modal for Cross/Isolated), `5x` (opens modal with leverage slider up to 125x), and `S` (Single-Asset Mode).
- **Order Form:** Tabs for `Limit`, `Market`, `Conditional`.
  - `Avbl 0.00 USDT` with transfer icon.
  - Price input with `BBO` quick-match button.
  - Size input with unit switcher (`USDT`/`BTC`).
  - Percentage slider with 5 diamond stops (`0%`, `25%`, `50%`, `75%`, `100%`).
  - Checkboxes for `TP/SL` and `Reduce-Only`, plus `TIF GTC` indicator.
  - Dual action buttons: `Buy/Long` (green) and `Sell/Short` (red).
  - Risk output: `Liq Price -- USDT`, `Cost 0.00 USDT`, `Max 0.00 USDT`.
  - Onboarding CTA: `% Fee level` and `Finish Quiz to Get Started` button.
- **Account Card:** `Margin Ratio` circular gauge showing `0.00%`, `Maintenance Margin: 0.0000 USDT`, `Margin Balance: 0.0000 USDT`, `Single-Asset Mode` pill, and the notice card: *"To start trading, please transfer assets to your Futures account"* with `Transfer`, `Buy Crypto`, and `Swap` buttons.

### 4.6 `PositionsOrdersTable`
- **Tabs:** `Positions(0)`, `Open Orders(0)`, `Order History`, `Trade History`, `Transaction History`, `Position History`, `Bots`, `Assets`.
- **Controls:** `Hide Other Symbols` checkbox.
- **Columns:** `Symbol`, `Size`, `Entry Price`, `Break Even Price`, `Mark Price`, `Liq.Price`, `Margin Ratio`, `Margin`, `PNL(ROI %)`, `Est. Funding Fee`, `MKT Close All`, `PnL-Based Close All`, `Reverse`, `TP/SL for position`, `TP/SL`.
- **Empty State:** Illustrated empty document icon with text *"You have no position."*

### 4.7 `BottomTickerStrip`
- **Height:** 26px fixed.
- **Left:** Glowing green dot with `Stable connection`.
- **Center:** Smoothly scrolling ticker tape with pairs: `RAYSOLUSDT +24.33% 1.5959`, `MARSCOINUSDT +18.64% 0.13240`, `BTCUSDT +1.12% 77,840.4`, `SAGAUSDT +7.17% 0.01614`, `ZECUSDT -1.10% 1,157.07`, `IOSTUSDT -14.54% 0.0009370`, etc.
- **Right:** Navigation links: `Campaign Center`, `Announcements`, `Disclaimer`, `Futures Chatroom`, `Cookie Preferences`.

---

## 5. Master Page Composition (`/trade`)

`apps/web/src/app/trade/page.tsx` renders `<BinanceFuturesDesk />` inside a full-bleed container that removes parent shell margins, presenting an uninterrupted immersive experience.

---

## 6. Data Stream & Resiliency Architecture

- **Primary:** `useBinanceFuturesWs` connects to the public Binance Futures WebSocket:
  - `wss://fstream.binance.com/ws/btcusdt@ticker/btcusdt@depth20@100ms/btcusdt@aggTrade`
- **Fallback Simulation:** If the WebSocket is blocked or offline, an integrated deterministic generator produces continuous price fluctuations, updates the order book depths, appends trade executions, and maintains the countdown clock without any visual disruption.

---

## 7. Quality Assurance & Verification Plan

1. **Static Type & Lint Checks:** Execute `pnpm run typecheck` and `pnpm run lint` in `apps/web`.
2. **Visual Inspection:** Verify that all 9 zones match the reference image down to the smallest detail (BBO button, slider diamond markers, in-chart floating pill, footer ticker).
3. **Interactive Validation:** Test timeframe selection, order type switching, slider movements, input fields, and tab switching across the order book, trades, and positions tables.
