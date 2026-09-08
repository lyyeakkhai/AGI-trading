import React from "react";
import type { DatasetDefinition } from "@/lib/researchApi";
import { Database } from "lucide-react";

interface RowProps { label: string; value?: string | number | null | boolean }
function Row({ label, value }: RowProps) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#1A1F25] last:border-0">
      <span className="text-xs text-gray-500 font-mono">{label}</span>
      <span className="text-xs text-gray-200 font-mono tabular-nums">{value == null ? "—" : String(value)}</span>
    </div>
  );
}

const QUALITY_COLOR: Record<string, string> = {
  good: "text-green-400", degraded: "text-yellow-400", poor: "text-red-400", unknown: "text-gray-500",
};

interface Props { dataset: DatasetDefinition }

export function DatasetCard({ dataset }: Props) {
  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">
        <Database size={12} /> Dataset
      </div>
      <Row label="Market" value={dataset.market} />
      <Row label="Symbol" value={dataset.symbol} />
      <Row label="Timeframe" value={dataset.timeframe} />
      <Row label="Start" value={new Date(dataset.start_timestamp).toLocaleString()} />
      <Row label="End" value={new Date(dataset.end_timestamp).toLocaleString()} />
      {dataset.candle_count != null && <Row label="Candle Count" value={dataset.candle_count.toLocaleString()} />}
      {dataset.source_id && <Row label="Source" value={dataset.source_id} />}
      <div className="flex justify-between items-center py-1.5">
        <span className="text-xs text-gray-500 font-mono">Data Quality</span>
        <span className={`text-xs font-mono uppercase font-bold ${QUALITY_COLOR[dataset.data_quality] ?? "text-gray-400"}`}>
          {dataset.data_quality}
        </span>
      </div>
      {dataset.has_missing_bars && (
        <div className="mt-2 text-[11px] font-mono text-yellow-500 bg-yellow-950/20 border border-yellow-800/30 rounded px-2 py-1">
          ⚠ Dataset has missing bars — results may be affected.
        </div>
      )}
    </div>
  );
}
