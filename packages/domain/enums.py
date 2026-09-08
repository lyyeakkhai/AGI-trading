from enum import Enum


class TradingMode(str, Enum):
    PAPER = "paper"
    LIVE = "live"


class AppEnv(str, Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"


class ExecutionStatus(str, Enum):
    PENDING = "pending"
    SUBMITTING = "submitting"
    SUBMITTED = "submitted"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    EXPIRED = "expired"
    UNKNOWN = "unknown"


class RiskDecisionType(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"


class MarketRegime(str, Enum):
    TRENDING_UP = "trending_up"
    TRENDING_DOWN = "trending_down"
    RANGING = "ranging"
    VOLATILE = "volatile"
    HIGH_VOLATILITY = "high_volatility"
    LOW_VOLATILITY = "low_volatility"
    UNCERTAIN = "uncertain"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    CONSUMED = "consumed"


class DivergenceType(str, Enum):
    INFORMATIONAL = "informational"
    RESOLVABLE = "resolvable"
    UNEXPECTED_ORDER = "unexpected_order"
    UNEXPECTED_BALANCE = "unexpected_balance"
    UNKNOWN_EXECUTION = "unknown_execution"
    CRITICAL = "critical"


class Timeframe(str, Enum):
    M1 = "1m"
    M15 = "15m"
    H1 = "1h"
    H4 = "4h"


# ── Research Experiment System ──────────────────────────────────────────────


class ExperimentStatus(str, Enum):
    DRAFT = "DRAFT"
    READY = "READY"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"


class ExperimentCategory(str, Enum):
    TREND_FOLLOWING = "trend_following"
    BREAKOUT = "breakout"
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    VOLATILITY = "volatility"
    VOLUME = "volume"
    MARKET_STRUCTURE = "market_structure"
    MULTI_FACTOR = "multi_factor"
    OTHER = "other"


class ValidationRunType(str, Enum):
    BACKTEST = "BACKTEST"
    OUT_OF_SAMPLE = "OUT_OF_SAMPLE"
    WALK_FORWARD = "WALK_FORWARD"
    REGIME_ANALYSIS = "REGIME_ANALYSIS"


class ConclusionOutcome(str, Enum):
    SUPPORTED = "SUPPORTED"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    REJECTED = "REJECTED"
    INCONCLUSIVE = "INCONCLUSIVE"


class ExperimentLinkType(str, Enum):
    FOLLOW_UP = "FOLLOW_UP"
    VARIANT = "VARIANT"
    REFINEMENT = "REFINEMENT"
    REPLICATION = "REPLICATION"
    CHALLENGE = "CHALLENGE"


class ResearchNoteType(str, Enum):
    OBSERVATION = "OBSERVATION"
    HYPOTHESIS = "HYPOTHESIS"
    ASSUMPTION = "ASSUMPTION"
    FINDING = "FINDING"
    FAILURE = "FAILURE"
    INTERPRETATION = "INTERPRETATION"
    DECISION = "DECISION"
    NEXT_STEP = "NEXT_STEP"
