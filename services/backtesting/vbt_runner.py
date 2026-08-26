import pandas as pd
from typing import Dict, Any, List
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

try:
    import vectorbt as vbt
    VBT_AVAILABLE = True
except ImportError:
    VBT_AVAILABLE = False

def run_vbt_backtest(
    prices: pd.Series,
    entries: pd.Series,
    exits: pd.Series,
    fees: float = 0.001,
    slippage: float = 0.0005,
    init_cash: float = 10000.0
) -> Dict[str, Any]:
    if not VBT_AVAILABLE:
        logger.warning("vectorbt is not available. Falling back to simple metrics.")
        return {}

    # High-speed backtest using vectorbt
    pf = vbt.Portfolio.from_signals(
        prices,
        entries,
        exits,
        init_cash=init_cash,
        fees=fees,
        slippage=slippage,
        freq='1d'  # Assumed frequency, could be parameterized
    )

    # Return key metrics
    return {
        "total_return": pf.total_return(),
        "max_drawdown": pf.max_drawdown(),
        "win_rate": pf.trades.win_rate(),
        "sharpe_ratio": pf.sharpe_ratio(),
        "sortino_ratio": pf.sortino_ratio()
    }
