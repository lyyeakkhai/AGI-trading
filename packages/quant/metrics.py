import numpy as np
from typing import List, Dict, Any
from decimal import Decimal
import pandas as pd

def calculate_performance_metrics(
    equity_curve: List[Decimal],
    trade_pnls: List[Decimal],
    risk_free_rate: float = 0.0,
    periods_per_year: int = 365
) -> Dict[str, Any]:
    if not equity_curve or len(equity_curve) < 2:
        return {
            "gross_return": 0.0,
            "net_return": 0.0,
            "max_drawdown": 0.0,
            "win_rate": 0.0,
            "expectancy": 0.0,
            "sharpe_ratio": 0.0,
            "sortino_ratio": 0.0
        }

    # Use floats for scientific calculations
    equity_series = pd.Series([float(e) for e in equity_curve])
    returns = equity_series.pct_change().dropna()
    
    initial_equity = float(equity_curve[0])
    final_equity = float(equity_curve[-1])
    
    # Net return (assuming equity curve includes fees already)
    net_return = (final_equity - initial_equity) / initial_equity if initial_equity > 0 else 0.0
    gross_return = net_return # simplified unless fees are separate
    
    # Max Drawdown
    cummax = equity_series.cummax()
    drawdown = (equity_series - cummax) / cummax
    max_drawdown = float(drawdown.min()) if not drawdown.empty else 0.0
    
    # Trade Metrics
    win_rate = 0.0
    expectancy = 0.0
    if trade_pnls:
        pnls = [float(p) for p in trade_pnls]
        winning_trades = [p for p in pnls if p > 0]
        losing_trades = [p for p in pnls if p <= 0]
        
        win_rate = len(winning_trades) / len(pnls) if len(pnls) > 0 else 0.0
        avg_win = float(np.mean(winning_trades)) if winning_trades else 0.0
        avg_loss = float(np.mean(losing_trades)) if losing_trades else 0.0
        
        expectancy = (win_rate * avg_win) + ((1 - win_rate) * avg_loss)
        
    # Sharpe & Sortino (annualized)
    sharpe_ratio = 0.0
    sortino_ratio = 0.0
    
    if len(returns) > 1 and returns.std() != 0:
        mean_return = returns.mean()
        std_return = returns.std()
        sharpe_ratio = float((mean_return - risk_free_rate) / std_return * np.sqrt(periods_per_year))
        
        downside_returns = returns[returns < 0]
        if len(downside_returns) > 1 and downside_returns.std() != 0:
            downside_std = downside_returns.std()
            sortino_ratio = float((mean_return - risk_free_rate) / downside_std * np.sqrt(periods_per_year))
            
    return {
        "gross_return": float(gross_return),
        "net_return": float(net_return),
        "max_drawdown": float(max_drawdown),
        "win_rate": float(win_rate),
        "expectancy": float(expectancy),
        "sharpe_ratio": float(sharpe_ratio),
        "sortino_ratio": float(sortino_ratio)
    }
