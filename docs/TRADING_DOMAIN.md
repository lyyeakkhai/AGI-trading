# Trading Domain

The Trading Domain defines the language of the system. It abstracts exchange-specific mechanics into a unified model used by both Humans and AI.

## Core Entities

### 1. TradingPlan
Represents the *intent* of a trade. 
- **symbol**: e.g., `BTC/USDT`
- **market**: `spot` or `futures`
- **direction**: `LONG` or `SHORT`
- **entry_price**: Target entry level (limit). If null, implies a market entry.
- **stop_loss_price**: The invalidation level.
- **take_profit_prices**: Array of target levels.
- **risk_percent**: The percentage of equity to risk on this trade.
- **leverage**: (Futures only) The leverage multiplier.

### 2. Order
An executable instruction sent to the exchange. A `TradingPlan` may generate multiple `Order` objects (e.g., an Entry order, a Stop Loss order, and Take Profit orders).
- **order_type**: `MARKET`, `LIMIT`, `STOP_MARKET`, `TAKE_PROFIT_MARKET`, etc.
- **reduce_only**: Boolean flag (Futures only) to ensure closing orders do not flip the position.

### 3. Position
The current holding state on the exchange.
- **Spot**: Represents the asset balance (e.g., holding 1.5 BTC).
- **Futures**: Represents the contract position, tracking entry price, mark price, leverage, liquidation price, and unrealized PnL.

## Spot vs. Futures Semantics

- **Spot**: `LONG` implies buying the base asset. `SHORT` implies selling the base asset (requires holding it first). Positions are just balances.
- **Futures**: `LONG` and `SHORT` are contract directions. Requires managing leverage, margin mode (isolated/cross), and monitoring liquidation. Orders must use `reduce_only` for SL/TP to prevent accidental reversal.
