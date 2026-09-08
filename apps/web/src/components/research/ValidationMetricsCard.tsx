import React from "react";
import type { ValidationMetrics } from "@/lib/researchApi";

interface MetricRowProps { label: string; value: string | number | null | undefined; positive?: boolean; negative?: boolean }

function MetricRow({ label, value, positive, negative }: MetricRowProps) {
  const color = value == null ? "text-gray-600" : positive ? "text-green-400" : negative ? "text-red-400" : "text-gray-200";
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#1A1F25] last:border-0">
      <span className="text-xs text-gray-500 font-mono">{label}</span>
      <span className={`text-xs font-mono tabular-nums font-medium ${color}`}>
        {value == null ? "—" : String(value)}
      </span>
    </div>
  );
}

function pct(v?: string | null) { return v == null ? null : `${(+v * 100).toFixed(2)}%`; }
function dec(v?: string | null, dp = 3) { return v == null ? null : (+v).toFixed(dp); }

interface Props { metrics: ValidationMetrics; title?: string }

export function ValidationMetricsCard({ metrics, title = "Performance Metrics" }: Props) {
  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">{title}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-2">Returns</div>
          <MetricRow label="Gross Return" value={pct(metrics.gross_return_pct)} positive={(+(metrics.gross_return_pct ?? 0)) > 0} negative={(+(metrics.gross_return_pct ?? 0)) < 0} />
          <MetricRow label="Net Return" value={pct(metrics.net_return_pct)} positive={(+(metrics.net_return_pct ?? 0)) > 0} negative={(+(metrics.net_return_pct ?? 0)) < 0} />
          <MetricRow label="Avg Trade" value={pct(metrics.avg_trade_pct)} />
          <MetricRow label="Largest Win" value={pct(metrics.largest_win_pct)} positive />
          <MetricRow label="Largest Loss" value={pct(metrics.largest_loss_pct)} negative />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-2">Risk &amp; Quality</div>
          <MetricRow label="Max Drawdown" value={pct(metrics.max_drawdown_pct)} negative />
          <MetricRow label="Sharpe Ratio" value={dec(metrics.sharpe_ratio)} positive={(+(metrics.sharpe_ratio ?? 0)) > 1} negative={(+(metrics.sharpe_ratio ?? 0)) < 0} />
          <MetricRow label="Profit Factor" value={dec(metrics.profit_factor, 2)} positive={(+(metrics.profit_factor ?? 0)) > 1} negative={(+(metrics.profit_factor ?? 0)) < 1} />
          <MetricRow label="Win Rate" value={pct(metrics.win_rate)} />
          <MetricRow label="Trade Count" value={metrics.trade_count} />
          <MetricRow label="Expectancy" value={dec(metrics.expectancy, 4)} positive={(+(metrics.expectancy ?? 0)) > 0} negative={(+(metrics.expectancy ?? 0)) < 0} />
          <MetricRow label="Max Consec. Losses" value={metrics.max_consecutive_losses} />
        </div>
      </div>
    </div>
  );
}
