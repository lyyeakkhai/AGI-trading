# Trading Chart Tools

The UI uses `lightweight-charts` by TradingView.

## Visualizing Trading Plans
When a user selects a `TradingPlan` (or is drafting one in the Order Panel), the chart must overlay:
- **Entry Line**: A solid/dashed line at the target entry price.
- **Stop Loss Line**: A red line at the invalidation level, with a shaded zone between entry and SL showing the risk amount.
- **Take Profit Lines**: Green lines at target levels.

## AI Chart Tool Interoperability
Hermes can call `chart.draw_line`, `chart.draw_zone`, etc.
- The UI must subscribe to these drawing updates via WebSockets or polling.
- Drawings created by the AI must be visually distinct (e.g., a small "AI" badge or specific color scheme) to differentiate them from manual user drawings.
