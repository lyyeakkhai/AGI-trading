# Trading Risk Engine

The Risk Engine is a strictly deterministic module. **No AI or Human can bypass it.**

## Validation Rules
1. **Balance Check**: Ensures sufficient available funds (cash for Spot, margin for Futures).
2. **Exposure Limits**: Prevents the total portfolio exposure from exceeding predefined limits (e.g., max 50% capital deployed).
3. **Concentration Limits**: Prevents too much capital allocated to a single asset.
4. **Position Sizing**: Verifies that the distance from Entry to Stop Loss, multiplied by the quantity, does not exceed the allowed `risk_percent` (e.g., max 2% loss per trade).
5. **Drawdown Limits**: Halts new trade creation if the portfolio is in a severe drawdown.
6. **Kill Switch**: A manual override to instantly reject all new plans and close existing positions.

## Enforcement
The API `evaluate_trade()` function returns a `RiskDecision`. Any `RiskDecision` that is not explicitly `APPROVED` will result in the `TradingPlan` being marked as `REJECTED`.
