export type MarketType = 'spot' | 'futures';
export type TradeDirection = 'long' | 'short';

export interface TradingPlan {
  symbol: string;
  market: MarketType;
  direction: TradeDirection;
  entry: number | null;
  stopLoss: number | null;
  takeProfits: number[];
  positionSize: number | null;
  riskPercent: number | null;
}

export interface RiskRewardMetrics {
  riskAmount: number | null;
  rewardAmount: number | null;
  riskRewardRatio: number | null;
}
