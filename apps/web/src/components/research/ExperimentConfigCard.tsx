import React from "react";
import type { ExperimentConfig } from "@/lib/researchApi";

interface RowProps { label: string; value?: string | number | null }
function Row({ label, value }: RowProps) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#1A1F25] last:border-0">
      <span className="text-xs text-gray-500 font-mono">{label}</span>
      <span className="text-xs text-gray-200 font-mono tabular-nums">{value ?? "—"}</span>
    </div>
  );
}

interface Props { config: ExperimentConfig }

export function ExperimentConfigCard({ config }: Props) {
  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4 space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Configuration</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-2">Market</div>
          <Row label="Asset" value={config.asset} />
          <Row label="Timeframe" value={config.timeframe} />
          <Row label="Start Date" value={new Date(config.start_date).toLocaleDateString()} />
          <Row label="End Date" value={new Date(config.end_date).toLocaleDateString()} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-2">Execution</div>
          <Row label="Initial Capital" value={`$${Number(config.initial_capital).toLocaleString()}`} />
          <Row label="Fee Rate" value={`${(+config.fee_rate * 100).toFixed(3)}%`} />
          <Row label="Slippage" value={`${config.slippage_bps} bps`} />
          <Row label="Position Sizing" value={config.position_sizing} />
          {config.risk_per_trade_pct && (
            <Row label="Risk / Trade" value={`${(+config.risk_per_trade_pct * 100).toFixed(2)}%`} />
          )}
          {config.stop_loss_pct && (
            <Row label="Stop Loss" value={`${(+config.stop_loss_pct * 100).toFixed(2)}%`} />
          )}
          {config.take_profit_pct && (
            <Row label="Take Profit" value={`${(+config.take_profit_pct * 100).toFixed(2)}%`} />
          )}
        </div>
      </div>
      {config.entry_conditions.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-2">Entry Conditions</div>
          <ul className="space-y-1">
            {config.entry_conditions.map((c, i) => (
              <li key={i} className="text-xs text-gray-400 flex gap-2"><span className="text-cyan-500">▸</span>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {config.exit_conditions.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-2">Exit Conditions</div>
          <ul className="space-y-1">
            {config.exit_conditions.map((c, i) => (
              <li key={i} className="text-xs text-gray-400 flex gap-2"><span className="text-orange-500">◂</span>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
