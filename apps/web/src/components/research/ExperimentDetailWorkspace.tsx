"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FlaskConical, RefreshCw } from "lucide-react";
import { researchApi, type ExperimentResponse } from "@/lib/researchApi";
import { ExperimentStatusBadge } from "./ExperimentStatusBadge";
import { ConclusionBadge } from "./ConclusionBadge";
import { HypothesisCard } from "./HypothesisCard";
import { ExperimentConfigCard } from "./ExperimentConfigCard";
import { DatasetCard } from "./DatasetCard";
import { ValidationRunsCard } from "./ValidationRunsCard";
import { ConclusionCard } from "./ConclusionCard";
import { ResearchNotesCard } from "./ResearchNotesCard";
import { LineageCard } from "./LineageCard";

interface Props { experimentId: string }

type Tab = "overview" | "hypothesis" | "config" | "validation" | "conclusion" | "notes" | "lineage";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "hypothesis", label: "Hypothesis" },
  { id: "config",     label: "Config & Dataset" },
  { id: "validation", label: "Validation" },
  { id: "conclusion", label: "Conclusion" },
  { id: "notes",      label: "Notes" },
  { id: "lineage",    label: "Lineage" },
];

export function ExperimentDetailWorkspace({ experimentId }: Props) {
  const [experiment, setExperiment] = useState<ExperimentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchApi.getExperiment(experimentId);
      setExperiment(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load experiment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [experimentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-gray-600" size={20} />
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="p-6">
        <div className="bg-red-950/30 border border-red-800/50 rounded p-4 text-xs text-red-400 font-mono">
          {error ?? "Experiment not found."}
        </div>
      </div>
    );
  }

  const exp = experiment;

  return (
    <div className="flex flex-col min-h-screen bg-[#040506] p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
        <Link href="/research" className="hover:text-gray-300 transition-colors flex items-center gap-1">
          <ArrowLeft size={12} /> Research
        </Link>
        <span>/</span>
        <span className="text-cyan-400">{exp.experiment_id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <FlaskConical size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">{exp.experiment_id}</span>
              <ExperimentStatusBadge status={exp.status} />
              {exp.conclusion && <ConclusionBadge outcome={exp.conclusion.outcome} />}
            </div>
            <h1 className="text-lg font-bold text-gray-100 mt-0.5 leading-tight">{exp.title}</h1>
            {exp.description && (
              <p className="text-sm text-gray-500 mt-1">{exp.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {exp.config?.asset && (
                <span className="text-xs font-mono text-gray-500">
                  {exp.config.asset} <span className="text-gray-700">/ {exp.config.timeframe}</span>
                </span>
              )}
              <span className="text-xs font-mono text-gray-600 capitalize">
                {exp.category.replace(/_/g, " ")}
              </span>
              <span className="text-xs font-mono text-gray-700">
                {exp.validation_runs.length} validation run{exp.validation_runs.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={load}
          className="p-2 rounded text-gray-500 hover:text-gray-300 hover:bg-[#131920] transition-colors border border-transparent hover:border-[#222B32] flex-shrink-0"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#222B32] flex gap-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "text-cyan-400 border-cyan-400"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Mini metrics summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Status", value: <ExperimentStatusBadge status={exp.status} /> },
                { label: "Validation Runs", value: <span className="text-2xl font-mono font-bold text-gray-100 tabular-nums">{exp.validation_runs.length}</span> },
                { label: "Notes", value: <span className="text-2xl font-mono font-bold text-gray-100 tabular-nums">{exp.notes.length}</span> },
                { label: "Created", value: <span className="text-xs font-mono text-gray-400">{new Date(exp.created_at).toLocaleDateString()}</span> },
              ].map((m) => (
                <div key={m.label} className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">{m.label}</div>
                  {m.value}
                </div>
              ))}
            </div>
            <HypothesisCard hypothesis={exp.hypothesis} />
            {exp.conclusion && <ConclusionCard conclusion={exp.conclusion} />}
          </div>
        )}

        {activeTab === "hypothesis" && (
          <HypothesisCard hypothesis={exp.hypothesis} />
        )}

        {activeTab === "config" && (
          <div className="space-y-4">
            {exp.config ? <ExperimentConfigCard config={exp.config} /> : (
              <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4 text-xs text-gray-600 font-mono">No configuration recorded yet.</div>
            )}
            {exp.dataset ? <DatasetCard dataset={exp.dataset} /> : (
              <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4 text-xs text-gray-600 font-mono">No dataset definition recorded yet.</div>
            )}
          </div>
        )}

        {activeTab === "validation" && (
          <ValidationRunsCard runs={exp.validation_runs} />
        )}

        {activeTab === "conclusion" && (
          exp.conclusion
            ? <ConclusionCard conclusion={exp.conclusion} />
            : <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4 text-xs text-gray-600 font-mono">No conclusion recorded yet.</div>
        )}

        {activeTab === "notes" && (
          <ResearchNotesCard notes={exp.notes} />
        )}

        {activeTab === "lineage" && (
          <LineageCard
            experimentId={exp.id}
            parentLinks={exp.parent_links}
            childLinks={exp.child_links}
          />
        )}
      </div>
    </div>
  );
}
