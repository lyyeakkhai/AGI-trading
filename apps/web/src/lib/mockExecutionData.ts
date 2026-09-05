export type OrderStatus =
  | "READY"
  | "SUBMITTING"
  | "SUBMITTED"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "UNKNOWN";

export type OrderType = "LIMIT" | "MARKET" | "STOP" | "STOP_LIMIT";
export type OrderSide = "LONG" | "SHORT";
export type ExecutionEnvironment = "PAPER" | "TESTNET" | "LIVE";

export interface ExecutionTimelineStep {
  label: string;
  timestamp: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING" | "FAILED";
  detail: string;
}

export interface ExecutionRequest {
  id: string; // EXE-0042
  proposalId: string; // PROP-0042
  riskDecisionId: string; // RISK-0042
  approvalId: string; // APR-0042
  idempotencyKey: string; // EXEC-PROP-0042
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: string;
  requestedPrice: number;
  stopPrice?: number;
  takeProfitPrice?: number;
  riskPercent: number;
  environment: ExecutionEnvironment;
  status: OrderStatus;
  createdAt: string;
  approvedAt: string;
  submittedAt?: string;
  completedAt?: string;
  exchangeOrderId?: string;
  avgFillPrice?: number;
  filledQuantity?: string;
  remainingQuantity?: string;
  slippageBps?: number;
  feeUsd?: number;
  failureReason?: string;
  timeline: ExecutionTimelineStep[];
}

export interface ExecutionMetrics {
  pendingApproval: number;
  readyToExecute: number;
  submitted: number;
  partiallyFilled: number;
  filledToday: number;
  failed: number;
  cancelled: number;
  fillRatePercent: number;
  avgExecutionTimeMs: number;
  avgSlippageBps: number;
  totalFeesUsd: number;
}

export const initialExecutionRequests: ExecutionRequest[] = [
  {
    id: "EXE-0042",
    proposalId: "PROP-0042",
    riskDecisionId: "RISK-0042",
    approvalId: "APR-0042",
    idempotencyKey: "EXEC-PROP-0042",
    symbol: "BTC/USDT",
    side: "LONG",
    orderType: "LIMIT",
    quantity: "0.042 BTC",
    requestedPrice: 114000,
    stopPrice: 111500,
    takeProfitPrice: 120500,
    riskPercent: 0.8,
    environment: "PAPER",
    status: "READY",
    createdAt: "2026-09-04 09:30:12",
    approvedAt: "2026-09-04 09:35:45",
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "09:30:12",
        status: "COMPLETED",
        detail: "Hermes formulated trend breakout long setup.",
      },
      {
        label: "Risk Validation",
        timestamp: "09:32:04",
        status: "COMPLETED",
        detail: "Passed all 6 deterministic safety checks. Risk: 0.8%.",
      },
      {
        label: "Owner Approval",
        timestamp: "09:35:45",
        status: "COMPLETED",
        detail: "Cryptographic human-in-the-loop authorization granted.",
      },
      {
        label: "Execution Engine",
        timestamp: "09:35:46",
        status: "ACTIVE",
        detail: "Ready for paper order routing.",
      },
    ],
  },
  {
    id: "EXE-0043",
    proposalId: "PROP-0043",
    riskDecisionId: "RISK-0043",
    approvalId: "APR-0043",
    idempotencyKey: "EXEC-PROP-0043",
    symbol: "ETH/USDT",
    side: "LONG",
    orderType: "LIMIT",
    quantity: "0.65 ETH",
    requestedPrice: 3480,
    stopPrice: 3390,
    takeProfitPrice: 3680,
    riskPercent: 0.7,
    environment: "PAPER",
    status: "READY",
    createdAt: "2026-09-04 09:40:00",
    approvedAt: "2026-09-04 09:42:15",
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "09:40:00",
        status: "COMPLETED",
        detail: "Support bounce mean-reversion setup identified.",
      },
      {
        label: "Risk Validation",
        timestamp: "09:41:10",
        status: "COMPLETED",
        detail: "Correlated crypto exposure within 60% ceiling.",
      },
      {
        label: "Owner Approval",
        timestamp: "09:42:15",
        status: "COMPLETED",
        detail: "Approved by operator.",
      },
      {
        label: "Execution Engine",
        timestamp: "09:42:16",
        status: "ACTIVE",
        detail: "Ready for order dispatch.",
      },
    ],
  },
  {
    id: "EXE-0041",
    proposalId: "PROP-0041",
    riskDecisionId: "RISK-0041",
    approvalId: "APR-0041",
    idempotencyKey: "EXEC-PROP-0041",
    symbol: "BTC/USDT",
    side: "SHORT",
    orderType: "LIMIT",
    quantity: "0.035 BTC",
    requestedPrice: 114850,
    stopPrice: 116200,
    takeProfitPrice: 111500,
    riskPercent: 0.6,
    environment: "PAPER",
    status: "SUBMITTED",
    createdAt: "2026-09-04 08:45:00",
    approvedAt: "2026-09-04 08:50:00",
    submittedAt: "2026-09-04 08:50:10",
    exchangeOrderId: "BIN-SIM-99214",
    remainingQuantity: "0.035 BTC",
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "08:45:00",
        status: "COMPLETED",
        detail: "Resistance rejection scalp formulated.",
      },
      {
        label: "Risk Validation",
        timestamp: "08:48:12",
        status: "COMPLETED",
        detail: "Pre-trade risk engine approved.",
      },
      {
        label: "Owner Approval",
        timestamp: "08:50:00",
        status: "COMPLETED",
        detail: "Approved by operator.",
      },
      {
        label: "Order Submitted",
        timestamp: "08:50:10",
        status: "ACTIVE",
        detail: "Placed on simulated orderbook resting limit.",
      },
    ],
  },
  {
    id: "EXE-0040",
    proposalId: "PROP-0040",
    riskDecisionId: "RISK-0040",
    approvalId: "APR-0040",
    idempotencyKey: "EXEC-PROP-0040",
    symbol: "ETH/USDT",
    side: "LONG",
    orderType: "LIMIT",
    quantity: "0.50 ETH",
    requestedPrice: 3420,
    stopPrice: 3340,
    takeProfitPrice: 3600,
    riskPercent: 0.5,
    environment: "PAPER",
    status: "FILLED",
    createdAt: "2026-09-04 07:15:00",
    approvedAt: "2026-09-04 07:20:00",
    submittedAt: "2026-09-04 07:20:05",
    completedAt: "2026-09-04 07:20:07",
    exchangeOrderId: "BIN-SIM-99182",
    avgFillPrice: 3421.2,
    filledQuantity: "0.50 ETH",
    remainingQuantity: "0.00 ETH",
    slippageBps: 3.5,
    feeUsd: 1.71,
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "07:15:00",
        status: "COMPLETED",
        detail: "Breakout setup formulated.",
      },
      {
        label: "Risk Approved",
        timestamp: "07:18:22",
        status: "COMPLETED",
        detail: "Passed deterministic gate.",
      },
      {
        label: "Owner Approved",
        timestamp: "07:20:00",
        status: "COMPLETED",
        detail: "Signed by owner session.",
      },
      {
        label: "Order Submitted",
        timestamp: "07:20:05",
        status: "COMPLETED",
        detail: "Submitted to simulated matching engine.",
      },
      {
        label: "Order Filled",
        timestamp: "07:20:07",
        status: "COMPLETED",
        detail: "100% filled @ $3,421.20 (+3.5 bps slippage).",
      },
      {
        label: "Position Created",
        timestamp: "07:20:08",
        status: "COMPLETED",
        detail: "Added to active positions portfolio.",
      },
    ],
  },
  {
    id: "EXE-0039",
    proposalId: "PROP-0039",
    riskDecisionId: "RISK-0039",
    approvalId: "APR-0039",
    idempotencyKey: "EXEC-PROP-0039",
    symbol: "BTC/USDT",
    side: "LONG",
    orderType: "MARKET",
    quantity: "0.050 BTC",
    requestedPrice: 113500,
    riskPercent: 1.0,
    environment: "PAPER",
    status: "FILLED",
    createdAt: "2026-09-04 06:10:00",
    approvedAt: "2026-09-04 06:12:00",
    submittedAt: "2026-09-04 06:12:02",
    completedAt: "2026-09-04 06:12:03",
    exchangeOrderId: "BIN-SIM-99055",
    avgFillPrice: 113522,
    filledQuantity: "0.050 BTC",
    remainingQuantity: "0.000 BTC",
    slippageBps: 1.9,
    feeUsd: 4.54,
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "06:10:00",
        status: "COMPLETED",
        detail: "Momentum continuation long formulated.",
      },
      {
        label: "Risk Approved",
        timestamp: "06:11:15",
        status: "COMPLETED",
        detail: "Risk: 1.0% (at max individual ceiling).",
      },
      {
        label: "Owner Approved",
        timestamp: "06:12:00",
        status: "COMPLETED",
        detail: "Signed by owner session.",
      },
      {
        label: "Order Filled",
        timestamp: "06:12:03",
        status: "COMPLETED",
        detail: "Filled @ $113,522.00.",
      },
    ],
  },
  {
    id: "EXE-0038",
    proposalId: "PROP-0038",
    riskDecisionId: "RISK-0038",
    approvalId: "APR-0038",
    idempotencyKey: "EXEC-PROP-0038",
    symbol: "BTC/USDT",
    side: "SHORT",
    orderType: "LIMIT",
    quantity: "0.020 BTC",
    requestedPrice: 115200,
    riskPercent: 0.4,
    environment: "PAPER",
    status: "CANCELLED",
    createdAt: "2026-09-04 05:00:00",
    approvedAt: "2026-09-04 05:05:00",
    submittedAt: "2026-09-04 05:05:02",
    completedAt: "2026-09-04 05:45:00",
    exchangeOrderId: "BIN-SIM-98920",
    failureReason: "User manually cancelled resting order after trend invalidation.",
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "05:00:00",
        status: "COMPLETED",
        detail: "Formulated short limit.",
      },
      {
        label: "Order Submitted",
        timestamp: "05:05:02",
        status: "COMPLETED",
        detail: "Resting limit on order book.",
      },
      {
        label: "Order Cancelled",
        timestamp: "05:45:00",
        status: "FAILED",
        detail: "Cancelled by owner.",
      },
    ],
  },
  {
    id: "EXE-0037",
    proposalId: "PROP-0037",
    riskDecisionId: "RISK-0037",
    approvalId: "APR-0037",
    idempotencyKey: "EXEC-PROP-0037",
    symbol: "SOL/USDT",
    side: "LONG",
    orderType: "LIMIT",
    quantity: "20.0 SOL",
    requestedPrice: 198.5,
    stopPrice: 192.0,
    takeProfitPrice: 215.0,
    riskPercent: 0.5,
    environment: "PAPER",
    status: "PARTIALLY_FILLED",
    createdAt: "2026-09-04 04:30:00",
    approvedAt: "2026-09-04 04:32:00",
    submittedAt: "2026-09-04 04:32:05",
    exchangeOrderId: "BIN-SIM-98844",
    avgFillPrice: 198.45,
    filledQuantity: "12.0 SOL",
    remainingQuantity: "8.0 SOL",
    slippageBps: 1.2,
    feeUsd: 0.95,
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "04:30:00",
        status: "COMPLETED",
        detail: "Solana dip bounce long formulated.",
      },
      {
        label: "Order Submitted",
        timestamp: "04:32:05",
        status: "COMPLETED",
        detail: "Resting limit on order book.",
      },
      {
        label: "Partially Filled",
        timestamp: "04:33:15",
        status: "ACTIVE",
        detail: "60% filled (12/20 SOL @ $198.45). Remaining 8 SOL resting.",
      },
    ],
  },
  {
    id: "EXE-0036",
    proposalId: "PROP-0036",
    riskDecisionId: "RISK-0036",
    approvalId: "APR-0036",
    idempotencyKey: "EXEC-PROP-0036",
    symbol: "AVAX/USDT",
    side: "LONG",
    orderType: "LIMIT",
    quantity: "50.0 AVAX",
    requestedPrice: 28.5,
    riskPercent: 0.3,
    environment: "PAPER",
    status: "FAILED",
    createdAt: "2026-09-04 03:10:00",
    approvedAt: "2026-09-04 03:12:00",
    submittedAt: "2026-09-04 03:12:05",
    completedAt: "2026-09-04 03:12:06",
    failureReason: "Exchange rejected order: Insufficient balance / margin requirement in testnet account.",
    timeline: [
      {
        label: "Proposal Created",
        timestamp: "03:10:00",
        status: "COMPLETED",
        detail: "Formulated momentum order.",
      },
      {
        label: "Order Routing",
        timestamp: "03:12:05",
        status: "COMPLETED",
        detail: "Dispatched to exchange connector.",
      },
      {
        label: "Order Failed",
        timestamp: "03:12:06",
        status: "FAILED",
        detail: "Exchange rejection: Insufficient margin in account.",
      },
    ],
  },
];

export const initialExecutionMetrics: ExecutionMetrics = {
  pendingApproval: 3,
  readyToExecute: 2,
  submitted: 1,
  partiallyFilled: 1,
  filledToday: 4,
  failed: 1,
  cancelled: 1,
  fillRatePercent: 80,
  avgExecutionTimeMs: 420,
  avgSlippageBps: 2.1,
  totalFeesUsd: 15.77,
};
