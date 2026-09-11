import { useState, useMemo, useEffect } from 'react';
import { TradingPlan, RiskRewardMetrics, MarketType } from '../types/trading';

export function useTradingPlan(initialSymbol: string = 'BTCUSDT', initialMarket: MarketType = 'spot') {
  const [plan, setPlan] = useState<TradingPlan>({
    symbol: initialSymbol,
    market: initialMarket,
    direction: 'long',
    entry: null,
    stopLoss: null,
    takeProfits: [],
    positionSize: null,
    riskPercent: null,
  });

  useEffect(() => {
    setPlan((prev) => {
      if (prev.symbol === initialSymbol && prev.market === initialMarket) {
        return prev;
      }
      return {
        ...prev,
        symbol: initialSymbol,
        market: initialMarket,
      };
    });
  }, [initialSymbol, initialMarket]);

  const updatePlan = (updates: Partial<TradingPlan>) => {
    setPlan((prev: TradingPlan) => ({ ...prev, ...updates }));
  };

  const metrics = useMemo<RiskRewardMetrics>(() => {
    if (plan.entry === null || plan.stopLoss === null || plan.takeProfits.length === 0) {
      return { riskAmount: null, rewardAmount: null, riskRewardRatio: null };
    }

    const firstTp = plan.takeProfits[0];
    if (firstTp === null) {
      return { riskAmount: null, rewardAmount: null, riskRewardRatio: null };
    }

    let risk: number;
    let reward: number;

    if (plan.direction === 'long') {
      risk = plan.entry - plan.stopLoss;
      reward = firstTp - plan.entry;
    } else {
      risk = plan.stopLoss - plan.entry;
      reward = plan.entry - firstTp;
    }

    // Risk and reward should conceptually be positive if it's a valid setup
    const validRisk = risk > 0 ? risk : 0;
    const validReward = reward > 0 ? reward : 0;
    const ratio = validRisk > 0 ? validReward / validRisk : null;

    return {
      riskAmount: validRisk,
      rewardAmount: validReward,
      riskRewardRatio: ratio,
    };
  }, [plan]);

  return { plan, updatePlan, metrics };
}
