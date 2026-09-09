import React from 'react';
import { TradingPlan, RiskRewardMetrics } from '../types/trading';

interface TradePanelProps {
  plan: TradingPlan;
  updatePlan: (updates: Partial<TradingPlan>) => void;
  metrics: RiskRewardMetrics;
}

export function TradePanel({ plan, updatePlan, metrics }: TradePanelProps) {
  const handleNumberChange = (field: keyof TradingPlan, value: string) => {
    const parsed = value === '' ? null : parseFloat(value);
    updatePlan({ [field]: parsed });
  };

  const handleTpChange = (value: string) => {
    const parsed = value === '' ? [] : [parseFloat(value)];
    updatePlan({ takeProfits: parsed });
  };

  return (
    <div className="flex flex-col bg-[#0E0E0E] text-[#EDEDED] p-4 font-sans h-full overflow-y-auto space-y-4">
      {/* Toggles */}
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => updatePlan({ market: 'spot' })}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-sm border ${plan.market === 'spot' ? 'bg-[#1C1C1C] border-[#00E5FF] text-[#00E5FF]' : 'bg-[#000000] border-[#1C1C1C] text-[#8A8A8A]'}`}
          >
            SPOT
          </button>
          <button
            onClick={() => updatePlan({ market: 'futures' })}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-sm border ${plan.market === 'futures' ? 'bg-[#1C1C1C] border-[#00E5FF] text-[#00E5FF]' : 'bg-[#000000] border-[#1C1C1C] text-[#8A8A8A]'}`}
          >
            FUTURES
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => updatePlan({ direction: 'long' })}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-sm border ${plan.direction === 'long' ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]' : 'bg-[#000000] border-[#1C1C1C] text-[#8A8A8A]'}`}
          >
            LONG
          </button>
          <button
            onClick={() => updatePlan({ direction: 'short' })}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-sm border ${plan.direction === 'short' ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30]' : 'bg-[#000000] border-[#1C1C1C] text-[#8A8A8A]'}`}
          >
            SHORT
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="text-xs text-[#8A8A8A] mb-1">Entry Price</label>
          <input
            type="number"
            value={plan.entry || ''}
            onChange={(e) => handleNumberChange('entry', e.target.value)}
            className="bg-[#000000] border border-[#1C1C1C] rounded-sm px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-[#00E5FF]"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-[#8A8A8A] mb-1">Stop Loss (SL)</label>
          <input
            type="number"
            value={plan.stopLoss || ''}
            onChange={(e) => handleNumberChange('stopLoss', e.target.value)}
            className="bg-[#000000] border border-[#1C1C1C] rounded-sm px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-[#00E5FF]"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-[#8A8A8A] mb-1">Take Profit (TP)</label>
          <input
            type="number"
            value={plan.takeProfits[0] || ''}
            onChange={(e) => handleTpChange(e.target.value)}
            className="bg-[#000000] border border-[#1C1C1C] rounded-sm px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-[#00E5FF]"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-[#8A8A8A] mb-1">Position Size (USD)</label>
          <input
            type="number"
            value={plan.positionSize || ''}
            onChange={(e) => handleNumberChange('positionSize', e.target.value)}
            className="bg-[#000000] border border-[#1C1C1C] rounded-sm px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-[#00E5FF]"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-[#8A8A8A] mb-1">Risk % of Capital</label>
          <input
            type="number"
            step="0.1"
            value={plan.riskPercent || ''}
            onChange={(e) => handleNumberChange('riskPercent', e.target.value)}
            className="bg-[#000000] border border-[#1C1C1C] rounded-sm px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-[#00E5FF]"
            placeholder="1.0"
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4 p-3 bg-[#000000] border border-[#1C1C1C] rounded-sm space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8A8A8A]">R:R Ratio</span>
          <span className="text-sm font-mono text-[#00E5FF]">
            {metrics.riskRewardRatio ? metrics.riskRewardRatio.toFixed(2) : '-'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8A8A8A]">Risk</span>
          <span className="text-sm font-mono text-[#FF3B30]">
            {metrics.riskAmount ? metrics.riskAmount.toFixed(2) : '-'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8A8A8A]">Reward</span>
          <span className="text-sm font-mono text-[#00E676]">
            {metrics.rewardAmount ? metrics.rewardAmount.toFixed(2) : '-'}
          </span>
        </div>
      </div>

    </div>
  );
}
