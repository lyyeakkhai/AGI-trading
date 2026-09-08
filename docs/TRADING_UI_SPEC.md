# Trading UI Specification

The new `/trade` workspace is the core screen for human traders.

## Layout Configuration
A modular, grid-based layout maximizing screen real estate.

```text
┌─────────────────────────────────────────────────────────────┐
│                       TOP NAVIGATION                         │
├─────────────────────────────────────────────────────────────┤
│ Market Header (Symbol, Price, 24h Change, Funding Rate)      │
├──────────────────────────────────────┬──────────────────────┤
│                                      │                      │
│                                      │    ORDER PANEL       │
│             CHART                    │  - Spot / Futures    │
│        (TradingView)                 │  - Long / Short      │
│                                      │  - Type / Price      │
│                                      │  - Quantity          │
│                                      │  - SL / TP           │
│                                      │  - Risk Preview      │
│                                      │  - [EXECUTE BTN]     │
├──────────────────────────────────────┴──────────────────────┤
│ BOTTOM TABS: Positions | Open Orders | Trade History        │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Market Header
- Displays selected asset.
- Shows key stats (24h high/low, volume).
- For Futures: Shows current funding rate and countdown.

### Order Panel
- **Market Switcher**: Toggle between Spot and Futures.
- **Direction**: Buy/Long vs Sell/Short buttons.
- **Order Types**: Market, Limit.
- **Input Fields**: Price, Size.
- **Advanced Options**: Checkboxes to enable Stop Loss and Take Profit, opening sub-inputs.
- **Risk Preview**: Dynamically updates to show "Risking $X (Y% of equity)" based on the SL distance and size.

### Bottom Panel
- **Positions**: Table showing Symbol, Side, Size, Entry Price, Mark Price, Liq. Price (Futures), Unrealized PnL.
- **Open Orders**: Table showing pending Limit/Stop orders with cancel buttons.
