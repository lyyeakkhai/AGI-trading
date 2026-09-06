export type SettingsCategory =
  | "general"
  | "trading"
  | "exchanges"
  | "hermes"
  | "risk"
  | "notifications"
  | "market-data"
  | "display"
  | "security";

export type HermesOperatingMode = "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";
export type HermesResearchDepth = "QUICK" | "STANDARD" | "DEEP";
export type DisplayDensity = "Compact" | "Comfortable";

export interface GeneralSettings {
  workspaceName: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  defaultTradingMode: "PAPER" | "LIVE";
}

export interface TradingSettings {
  mode: "PAPER" | "LIVE";
  paperTradingEnabled: boolean;
  liveTradingEnabled: boolean;
  explanation: string;
}

export interface ExchangeSettings {
  name: string;
  status: "CONNECTED" | "NOT_CONNECTED" | "ERROR";
  paperAvailable: boolean;
  liveDisabled: boolean;
  apiKeyMasked: string;
  apiSecretMasked: string;
  lastChecked: string;
}

export interface HermesSettings {
  status: "ACTIVE" | "PAUSED" | "STANDBY";
  monitoring: boolean;
  opportunityDetection: boolean;
  researchDepth: HermesResearchDepth;
  proposalGeneration: boolean;
  riskAwareness: boolean;
  autonomousExecution: boolean;
  operatingMode: HermesOperatingMode;
}

export interface RiskSettings {
  maxRiskPerTrade: number; // %
  maxPortfolioRisk: number; // %
  maxDailyLoss: number; // %
  maxOpenPositions: number;
  maxAssetExposure: number; // %
  maxCorrelatedExposure: number; // %
  minRiskReward: number; // R
  tradingLock: boolean; // OFF / ON (kill switch)
}

export interface NotificationSettings {
  channels: {
    inApp: boolean;
    email: boolean;
    telegram: boolean;
    push: boolean;
  };
  types: {
    opportunityDetected: boolean;
    tradeProposalCreated: boolean;
    riskRejection: boolean;
    positionOpened: boolean;
    positionClosed: boolean;
    dailyLossWarning: boolean;
    systemError: boolean;
    backtestCompleted: boolean;
  };
  severities: {
    critical: "Immediate";
    warning: "Immediate";
    informational: "In-App";
  };
}

export interface MarketDataSettings {
  provider: string;
  status: "CONNECTED" | "DISCONNECTED";
  updateFrequency: "10s" | "30s" | "1m" | "5m";
  markets: string[];
  defaultTimeframe: "15m" | "1H" | "4H" | "1D";
  dataMode: "SIMULATED" | "REALTIME";
}

export interface DisplaySettings {
  theme: string;
  appearance: "Dark";
  density: DisplayDensity;
  chartStyle: "Candles" | "Line";
  defaultChartInterval: "15m" | "1H" | "4H" | "1D";
  animations: "Reduced" | "Standard";
}

export interface SecuritySettings {
  currentSession: string;
  lastLogin: string;
  twoFactorAuth: string;
  apiCredentialStatus: string;
  liveTrading: string;
  sandboxIsolation: string;
}

export interface SettingsState {
  general: GeneralSettings;
  trading: TradingSettings;
  exchange: ExchangeSettings;
  hermes: HermesSettings;
  risk: RiskSettings;
  notifications: NotificationSettings;
  marketData: MarketDataSettings;
  display: DisplaySettings;
  security: SecuritySettings;
}

export interface SettingsActivityEvent {
  id: string;
  timestamp: string;
  category: string;
  title: string;
  description: string;
  changedField: string;
  previousValue: string;
  newValue: string;
  source: string;
}

export const initialSettingsData: SettingsState = {
  general: {
    workspaceName: "AGI Trading",
    timezone: "Asia/Phnom_Penh",
    currency: "USD",
    language: "English",
    dateFormat: "YYYY-MM-DD",
    defaultTradingMode: "PAPER",
  },
  trading: {
    mode: "PAPER",
    paperTradingEnabled: true,
    liveTradingEnabled: false,
    explanation: "Paper mode allows simulated execution without sending real orders.",
  },
  exchange: {
    name: "Binance",
    status: "NOT_CONNECTED",
    paperAvailable: true,
    liveDisabled: true,
    apiKeyMasked: "••••••••••••••••••••••••••••••••",
    apiSecretMasked: "••••••••••••••••••••••••••••••••",
    lastChecked: "2026-09-04 08:30:00 UTC",
  },
  hermes: {
    status: "ACTIVE",
    monitoring: true,
    opportunityDetection: true,
    researchDepth: "STANDARD",
    proposalGeneration: true,
    riskAwareness: true,
    autonomousExecution: false,
    operatingMode: "BALANCED",
  },
  risk: {
    maxRiskPerTrade: 1.0,
    maxPortfolioRisk: 5.0,
    maxDailyLoss: 3.0,
    maxOpenPositions: 5,
    maxAssetExposure: 40,
    maxCorrelatedExposure: 60,
    minRiskReward: 1.5,
    tradingLock: false,
  },
  notifications: {
    channels: {
      inApp: true,
      email: false,
      telegram: false,
      push: false,
    },
    types: {
      opportunityDetected: true,
      tradeProposalCreated: true,
      riskRejection: true,
      positionOpened: true,
      positionClosed: true,
      dailyLossWarning: true,
      systemError: true,
      backtestCompleted: true,
    },
    severities: {
      critical: "Immediate",
      warning: "Immediate",
      informational: "In-App",
    },
  },
  marketData: {
    provider: "Mock Market Data",
    status: "CONNECTED",
    updateFrequency: "1m",
    markets: ["BTC/USDT", "ETH/USDT"],
    defaultTimeframe: "1H",
    dataMode: "SIMULATED",
  },
  display: {
    theme: "Obsidian Intelligence",
    appearance: "Dark",
    density: "Comfortable",
    chartStyle: "Candles",
    defaultChartInterval: "1H",
    animations: "Reduced",
  },
  security: {
    currentSession: "Active",
    lastLogin: "Today at 08:30:14 UTC",
    twoFactorAuth: "Not Configured",
    apiCredentialStatus: "No credentials connected",
    liveTrading: "Disabled",
    sandboxIsolation: "Isolated in-memory simulation",
  },
};

export interface SearchableSettingItem {
  id: string;
  name: string;
  category: SettingsCategory;
  categoryLabel: string;
  description: string;
  keywords: string[];
}

export const searchableSettings: SearchableSettingItem[] = [
  {
    id: "general-workspace",
    name: "Workspace Name",
    category: "general",
    categoryLabel: "General",
    description: "Identifies the active local workspace and command center profile.",
    keywords: ["name", "workspace", "agi", "profile", "account"],
  },
  {
    id: "general-timezone",
    name: "Timezone",
    category: "general",
    categoryLabel: "General",
    description: "Local display timezone for market open, candle stamps, and audit logs.",
    keywords: ["timezone", "utc", "phnom penh", "time", "clock"],
  },
  {
    id: "general-currency",
    name: "Base Currency",
    category: "general",
    categoryLabel: "General",
    description: "Base settlement currency used across valuation and PnL reporting.",
    keywords: ["currency", "usd", "usdt", "fiat"],
  },
  {
    id: "trading-mode",
    name: "Trading Environment",
    category: "trading",
    categoryLabel: "Trading Mode",
    description: "Toggle between simulated Paper environment and locked Live execution.",
    keywords: ["trading", "mode", "paper", "live", "simulated", "execution"],
  },
  {
    id: "exchange-binance",
    name: "Exchange Connections (Binance)",
    category: "exchanges",
    categoryLabel: "Exchanges",
    description: "Binance Spot/Perp connection status, API keys, and connection testing.",
    keywords: ["binance", "exchange", "api", "keys", "credentials", "connection"],
  },
  {
    id: "hermes-status",
    name: "Hermes Agent Status",
    category: "hermes",
    categoryLabel: "Hermes",
    description: "Main Trading Agent operational pulse, monitoring loops, and reasoning engine.",
    keywords: ["hermes", "ai", "agent", "status", "active", "intelligence"],
  },
  {
    id: "hermes-mode",
    name: "Hermes Operating Mode",
    category: "hermes",
    categoryLabel: "Hermes",
    description: "Regime-based threshold mode: Conservative, Balanced, or Aggressive.",
    keywords: ["mode", "conservative", "balanced", "aggressive", "threshold", "evidence"],
  },
  {
    id: "hermes-research",
    name: "Research Depth",
    category: "hermes",
    categoryLabel: "Hermes",
    description: "Depth of multi-timeframe analysis and orderbook examination per opportunity.",
    keywords: ["depth", "research", "quick", "standard", "deep"],
  },
  {
    id: "hermes-autonomous",
    name: "Autonomous Execution",
    category: "hermes",
    categoryLabel: "Hermes",
    description: "Mandatory human-in-the-loop lock preventing unapproved order dispatch.",
    keywords: ["autonomous", "execution", "lock", "bypass", "approval"],
  },
  {
    id: "risk-per-trade",
    name: "Max Risk / Trade",
    category: "risk",
    categoryLabel: "Risk",
    description: "Maximum allowable account equity risked on any single trade proposal.",
    keywords: ["risk", "trade", "equity", "percent", "position sizing"],
  },
  {
    id: "risk-portfolio",
    name: "Max Portfolio Risk",
    category: "risk",
    categoryLabel: "Risk",
    description: "Cumulative sum of all open position stop loss risks across portfolio.",
    keywords: ["portfolio", "cumulative", "total", "risk", "exposure"],
  },
  {
    id: "risk-daily-loss",
    name: "Max Daily Loss (Circuit Breaker)",
    category: "risk",
    categoryLabel: "Risk",
    description: "Hard threshold triggering automatic daily trading halt if breached.",
    keywords: ["circuit breaker", "daily loss", "drawdown", "halt", "loss limit"],
  },
  {
    id: "risk-open-positions",
    name: "Max Open Positions",
    category: "risk",
    categoryLabel: "Risk",
    description: "Upper ceiling of simultaneous open positions allowed by risk engine.",
    keywords: ["open positions", "slots", "concurrency", "maximum"],
  },
  {
    id: "risk-asset-exposure",
    name: "Max Asset Exposure",
    category: "risk",
    categoryLabel: "Risk",
    description: "Maximum capital allocation allowed in any single asset ticker.",
    keywords: ["asset", "exposure", "concentration", "single ticker"],
  },
  {
    id: "risk-correlated-exposure",
    name: "Max Correlated Exposure",
    category: "risk",
    categoryLabel: "Risk",
    description: "Combined exposure ceiling across highly correlated crypto assets.",
    keywords: ["correlation", "correlated", "btc", "eth", "cluster"],
  },
  {
    id: "risk-min-rr",
    name: "Minimum Risk / Reward (R:R)",
    category: "risk",
    categoryLabel: "Risk",
    description: "Proposal rejection threshold if target profit to risk ratio is under limit.",
    keywords: ["rr", "risk reward", "ratio", "minimum", "profit factor"],
  },
  {
    id: "risk-kill-switch",
    name: "Trading Lock (Emergency Kill Switch)",
    category: "risk",
    categoryLabel: "Risk",
    description: "Global override instantly preventing any new proposals from opening positions.",
    keywords: ["lock", "kill switch", "emergency", "freeze", "halt"],
  },
  {
    id: "market-provider",
    name: "Market Data Provider",
    category: "market-data",
    categoryLabel: "Market Data",
    description: "Tick generation source and simulation intervals for chart feed.",
    keywords: ["market data", "feed", "mock", "provider", "frequency", "timeframe"],
  },
  {
    id: "notifications-channels",
    name: "Notification Channels",
    category: "notifications",
    categoryLabel: "Notifications",
    description: "Delivery targets: In-App, Email, Telegram, and Push dispatching.",
    keywords: ["notifications", "telegram", "email", "push", "channels", "alerts"],
  },
  {
    id: "display-theme",
    name: "Display & Theme",
    category: "display",
    categoryLabel: "Display",
    description: "Visual density, Obsidian Intelligence styling, and candlestick parameters.",
    keywords: ["theme", "display", "density", "obsidian", "dark", "candles"],
  },
  {
    id: "security-sessions",
    name: "Security & Sessions",
    category: "security",
    categoryLabel: "Security",
    description: "Session health, 2FA status, credential safeguards, and audit log link.",
    keywords: ["security", "session", "audit", "credentials", "2fa"],
  },
];

export const initialSettingsActivityLog: SettingsActivityEvent[] = [
  {
    id: "SET-EVT-01",
    timestamp: "2026-09-04 08:15:22",
    category: "Risk",
    title: "Risk Parameters Initialized",
    description: "Verified baseline 1.0% per-trade risk ceiling and 3.0% daily circuit breaker.",
    changedField: "Max Risk / Trade",
    previousValue: "1.0%",
    newValue: "1.0%",
    source: "System / Boot",
  },
  {
    id: "SET-EVT-02",
    timestamp: "2026-09-04 07:45:10",
    category: "Hermes",
    title: "Autonomous Execution Locked",
    description: "Confirmed human-in-the-loop governance; autonomous dispatch locked OFF.",
    changedField: "Autonomous Execution",
    previousValue: "OFF",
    newValue: "OFF",
    source: "Security Policy",
  },
  {
    id: "SET-EVT-03",
    timestamp: "2026-09-04 07:00:00",
    category: "Trading Mode",
    title: "Paper Sandbox Mode Selected",
    description: "Defaulted trading mode to Paper Sandbox for safe testing.",
    changedField: "Trading Mode",
    previousValue: "UNSET",
    newValue: "PAPER",
    source: "Owner",
  },
];
