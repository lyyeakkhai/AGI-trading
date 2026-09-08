"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Plus, Minus } from "lucide-react";
import { researchApi, type ExperimentCategory, type HypothesisConfig } from "@/lib/researchApi";

const CATEGORIES: ExperimentCategory[] = [
  "trend_following","breakout","momentum","mean_reversion","volatility","volume","market_structure","multi_factor","other",
];

const inputClass = "w-full bg-[#0E0E0E] border border-[#222B32] text-sm text-gray-200 font-mono rounded px-3 py-2 placeholder-gray-700 focus:outline-none focus:border-cyan-600 transition-colors";
const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5";

function StringListEditor({ label, values, onChange }: {
  label: string; values: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputClass + " flex-1"}
            value={v}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
          >
            <Minus size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="flex items-center gap-1.5 text-xs font-mono text-gray-600 hover:text-cyan-400 transition-colors"
      >
        <Plus size={12} /> Add
      </button>
    </div>
  );
}

export function NewExperimentForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExperimentCategory>("breakout");
  const [statement, setStatement] = useState("");
  const [rationale, setRationale] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [assumptions, setAssumptions] = useState<string[]>([""]);
  const [invalidationCriteria, setInvalidationCriteria] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const hypothesis: HypothesisConfig = {
      statement,
      rationale,
      expected_behavior: expectedBehavior,
      assumptions: assumptions.filter(Boolean),
      invalidation_criteria: invalidationCriteria.filter(Boolean),
    };

    try {
      const result = await researchApi.createExperiment({
        title,
        description: description || undefined,
        category,
        hypothesis,
      });
      router.push(`/research/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create experiment");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040506] p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FlaskConical size={20} className="text-cyan-400" />
        <div>
          <h1 className="text-base font-bold text-gray-100 font-mono">New Experiment</h1>
          <p className="text-[11px] text-gray-600 font-mono">Document a trading hypothesis before testing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta */}
        <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-5 space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Experiment Meta</div>

          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. BTC 4H Breakout With Volume Confirmation" required />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional context or background…" />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as ExperimentCategory)} required>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hypothesis */}
        <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-5 space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Hypothesis</div>

          <div>
            <label className={labelClass}>Statement *</label>
            <textarea className={inputClass} rows={2} value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Concise hypothesis statement…" required />
          </div>

          <div>
            <label className={labelClass}>Rationale *</label>
            <textarea className={inputClass} rows={2} value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Why might this be true?" required />
          </div>

          <div>
            <label className={labelClass}>Expected Behavior *</label>
            <textarea className={inputClass} rows={2} value={expectedBehavior} onChange={(e) => setExpectedBehavior(e.target.value)} placeholder="What should we observe if the hypothesis holds?" required />
          </div>

          <StringListEditor label="Assumptions" values={assumptions} onChange={setAssumptions} />
          <StringListEditor label="Invalidation Criteria" values={invalidationCriteria} onChange={setInvalidationCriteria} />
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-800/50 rounded p-3 text-xs text-red-400 font-mono">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-mono font-bold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-700/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creating…" : "Create Experiment"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-mono text-gray-500 hover:text-gray-300 border border-[#222B32] rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
