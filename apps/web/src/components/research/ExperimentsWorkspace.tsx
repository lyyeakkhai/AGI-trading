"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FlaskConical, Plus, RefreshCw } from "lucide-react";
import { researchApi, type ExperimentListItem } from "@/lib/researchApi";
import { ExperimentFilters } from "./ExperimentFilters";
import { ExperimentTable } from "./ExperimentTable";

export function ExperimentsWorkspace() {
  const [experiments, setExperiments] = useState<ExperimentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAsset, setFilterAsset] = useState("");
  const [filterConclusion, setFilterConclusion] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchApi.listExperiments({
        status: filterStatus as never || undefined,
        category: filterCategory as never || undefined,
        asset: filterAsset || undefined,
        conclusion_outcome: filterConclusion as never || undefined,
        limit: 100,
      });
      setExperiments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load experiments");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterAsset, filterConclusion]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col min-h-screen bg-[#040506] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical size={20} className="text-cyan-400" />
          <div>
            <h1 className="text-base font-bold text-gray-100 font-mono tracking-wide">Research</h1>
            <p className="text-[11px] text-gray-600 font-mono">Trading hypothesis experiments &amp; evidence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded text-gray-500 hover:text-gray-300 hover:bg-[#131920] transition-colors border border-transparent hover:border-[#222B32]"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/research/new"
            className="flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-700/50 rounded transition-colors"
          >
            <Plus size={14} /> New Experiment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <ExperimentFilters
        status={filterStatus}
        category={filterCategory}
        asset={filterAsset}
        conclusion={filterConclusion}
        onStatusChange={setFilterStatus}
        onCategoryChange={setFilterCategory}
        onAssetChange={setFilterAsset}
        onConclusionChange={setFilterConclusion}
      />

      {/* Summary counts */}
      {!loading && !error && (
        <div className="text-[11px] font-mono text-gray-600">
          {experiments.length} experiment{experiments.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Content */}
      {error && (
        <div className="bg-red-950/30 border border-red-800/50 rounded p-4 text-xs text-red-400 font-mono">{error}</div>
      )}
      {!error && (
        <ExperimentTable experiments={experiments} />
      )}
    </div>
  );
}
