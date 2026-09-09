# Trading Test Plan

## Core Philosophy
**Paper Trading Default:** All development, testing, and automated runs default to Paper mode. Live execution must require explicit, authenticated override.

## Unit Testing
1. **Risk Engine**: 
   - Mock portfolios with specific balances and positions.
   - Assert `REJECTED` for oversized plans, excessive concentration, and missing stop losses (if required by policy).
   - Assert correct math for position sizing logic.
2. **Domain Models**:
   - Validate Pydantic schema logic.
   - Ensure Futures vs. Spot validation logic holds (e.g., rejecting shorts on spot assets without borrowing logic).

## Integration Testing
1. **Exchange Adapter**:
   - Use CCXT's built-in sandbox modes (Binance Testnet).
   - Test retrieving Spot and Futures market data.
   - Test submitting and cancelling orders in the sandbox.
2. **Execution Flow**:
   - End-to-end test from `TradingPlan` creation -> Risk Validation -> Order generation -> Mock adapter response.

## E2E UI Testing
- Use Playwright to verify the new Top Navigation renders correctly.
- Verify the Order Panel inputs correctly calculate and display the Risk Preview.
- Ensure the Chart component mounts and updates when drawing commands are received.
