def should_escalate(symbol: str, timeframe: str, initial_confidence: float, regime: str) -> bool:
    # Basic policy: escalate if confidence is low, or market is volatile
    if initial_confidence < 0.6:
        return True
    if regime.lower() in ["volatile", "choppy"]:
        return True
    return False
