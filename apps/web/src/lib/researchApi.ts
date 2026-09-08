/**
 * Research Experiment API client.
 * Mirrors the FastAPI /api/v1/research/* endpoints.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ExperimentStatus =
  | "DRAFT"
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "VALIDATED"
  | "REJECTED"
  | "ARCHIVED";

export type ExperimentCategory =
  | "trend_following"
  | "breakout"
  | "momentum"
  | "mean_reversion"
  | "volatility"
  | "volume"
  | "market_structure"
  | "multi_factor"
  | "other";

export type ValidationRunType =
  | "BACKTEST"
  | "OUT_OF_SAMPLE"
  | "WALK_FORWARD"
  | "REGIME_ANALYSIS";

export type ConclusionOutcome =
  | "SUPPORTED"
  | "PARTIALLY_SUPPORTED"
  | "REJECTED"
  | "INCONCLUSIVE";

export type ExperimentLinkType =
  | "FOLLOW_UP"
  | "VARIANT"
  | "REFINEMENT"
  | "REPLICATION"
  | "CHALLENGE";

export type ResearchNoteType =
  | "OBSERVATION"
  | "HYPOTHESIS"
  | "ASSUMPTION"
  | "FINDING"
  | "FAILURE"
  | "INTERPRETATION"
  | "DECISION"
  | "NEXT_STEP";

export interface HypothesisConfig {
  statement: string;
  rationale: string;
  expected_behavior: string;
  assumptions: string[];
  invalidation_criteria: string[];
}

export interface ExperimentConfig {
  asset: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  initial_capital: string;
  fee_rate: string;
  slippage_bps: number;
  position_sizing: string;
  risk_per_trade_pct?: string | null;
  strategy_version_id?: string | null;
  strategy_parameters: Record<string, unknown>;
  entry_conditions: string[];
  exit_conditions: string[];
  stop_loss_pct?: string | null;
  take_profit_pct?: string | null;
  notes?: string | null;
}

export interface DatasetDefinition {
  market: string;
  symbol: string;
  timeframe: string;
  start_timestamp: string;
  end_timestamp: string;
  candle_count?: number | null;
  source_id?: string | null;
  data_version?: string | null;
  has_missing_bars: boolean;
  data_quality: string;
}

export interface ValidationMetrics {
  gross_return_pct?: string | null;
  net_return_pct?: string | null;
  max_drawdown_pct?: string | null;
  win_rate?: string | null;
  trade_count?: number | null;
  profit_factor?: string | null;
  expectancy?: string | null;
  sharpe_ratio?: string | null;
  sortino_ratio?: string | null;
  avg_trade_pct?: string | null;
  largest_win_pct?: string | null;
  largest_loss_pct?: string | null;
  volatility_annualized?: string | null;
  exposure_pct?: string | null;
  risk_per_trade_pct?: string | null;
  max_consecutive_losses?: number | null;
  recovery_factor?: string | null;
  equity_curve?: number[] | null;
  monthly_returns?: Record<string, number> | null;
  regime_breakdown?: Record<string, unknown> | null;
}

export interface ExperimentConclusion {
  outcome: ConclusionOutcome;
  evidence_summary: string;
  strengths: string[];
  weaknesses: string[];
  failure_reasons: string[];
  lessons_learned?: string | null;
  next_experiment_suggestion?: string | null;
}

export interface ValidationRunResponse {
  id: string;
  experiment_id: string;
  run_type: ValidationRunType;
  description?: string | null;
  config: Record<string, unknown>;
  metrics?: ValidationMetrics | null;
  passed?: boolean | null;
  backtest_job_id?: string | null;
  notes?: string | null;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
}

export interface NoteResponse {
  id: string;
  experiment_id: string;
  note_type: ResearchNoteType;
  content: string;
  stage?: string | null;
  author?: string | null;
  created_at: string;
}

export interface ExperimentLinkResponse {
  id: string;
  parent_experiment_id: string;
  child_experiment_id: string;
  link_type: ExperimentLinkType;
  created_at: string;
}

export interface ExperimentResponse {
  id: string;
  experiment_id: string;
  title: string;
  description?: string | null;
  status: ExperimentStatus;
  category: ExperimentCategory;
  hypothesis: HypothesisConfig;
  config?: ExperimentConfig | null;
  dataset?: DatasetDefinition | null;
  conclusion?: ExperimentConclusion | null;
  tags: string[];
  validation_runs: ValidationRunResponse[];
  notes: NoteResponse[];
  parent_links: ExperimentLinkResponse[];
  child_links: ExperimentLinkResponse[];
  created_at: string;
  updated_at: string;
}

export interface ExperimentListItem {
  id: string;
  experiment_id: string;
  title: string;
  status: ExperimentStatus;
  category: ExperimentCategory;
  asset?: string | null;
  timeframe?: string | null;
  conclusion_outcome?: ConclusionOutcome | null;
  validation_run_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateExperimentPayload {
  title: string;
  description?: string;
  category: ExperimentCategory;
  hypothesis: HypothesisConfig;
  config?: ExperimentConfig;
  dataset?: DatasetDefinition;
  tags?: string[];
}

export interface AddNotePayload {
  note_type: ResearchNoteType;
  content: string;
  stage?: string;
  author?: string;
}

export interface ListExperimentsParams {
  status?: ExperimentStatus;
  category?: ExperimentCategory;
  asset?: string;
  timeframe?: string;
  conclusion_outcome?: ConclusionOutcome;
  limit?: number;
  offset?: number;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const researchApi = {
  /** List experiments with optional filters */
  listExperiments(params: ListExperimentsParams = {}): Promise<ExperimentListItem[]> {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.category) q.set("category", params.category);
    if (params.asset) q.set("asset", params.asset);
    if (params.timeframe) q.set("timeframe", params.timeframe);
    if (params.conclusion_outcome) q.set("conclusion_outcome", params.conclusion_outcome);
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.offset != null) q.set("offset", String(params.offset));
    return apiFetch(`/api/v1/research/experiments?${q.toString()}`);
  },

  /** Get full experiment detail */
  getExperiment(id: string): Promise<ExperimentResponse> {
    return apiFetch(`/api/v1/research/experiments/${id}`);
  },

  /** Create a new experiment */
  createExperiment(payload: CreateExperimentPayload): Promise<ExperimentResponse> {
    return apiFetch("/api/v1/research/experiments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Update experiment fields or status */
  updateExperiment(
    id: string,
    payload: Partial<CreateExperimentPayload & { status: ExperimentStatus }>
  ): Promise<ExperimentResponse> {
    return apiFetch(`/api/v1/research/experiments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /** Add a research note */
  addNote(id: string, payload: AddNotePayload): Promise<NoteResponse> {
    return apiFetch(`/api/v1/research/experiments/${id}/notes`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Start a validation run */
  startValidationRun(
    id: string,
    payload: { run_type: ValidationRunType; description?: string; config?: Record<string, unknown> }
  ): Promise<ValidationRunResponse> {
    return apiFetch(`/api/v1/research/experiments/${id}/validation-runs`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Set experiment conclusion */
  setConclusion(id: string, conclusion: ExperimentConclusion): Promise<ExperimentResponse> {
    return apiFetch(`/api/v1/research/experiments/${id}/conclude`, {
      method: "POST",
      body: JSON.stringify({ conclusion }),
    });
  },

  /** Archive an experiment */
  archiveExperiment(id: string): Promise<ExperimentResponse> {
    return apiFetch(`/api/v1/research/experiments/${id}/archive`, { method: "POST" });
  },

  /** Create follow-up experiment */
  createFollowUp(
    parentId: string,
    payload: {
      title: string;
      hypothesis: HypothesisConfig;
      category?: ExperimentCategory;
      link_type?: ExperimentLinkType;
    }
  ): Promise<ExperimentResponse> {
    return apiFetch(`/api/v1/research/experiments/${parentId}/follow-up`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
