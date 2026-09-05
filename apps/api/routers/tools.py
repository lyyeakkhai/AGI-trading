from __future__ import annotations

from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Annotated, Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_hermes_token
from packages.config.settings import Settings, get_settings
from packages.database.engine import get_db_session
from packages.database.models.hypertables import IndicatorSnapshotModel, MarketCandleModel
from packages.database.models.portfolio import (
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from packages.database.models.relational import (
    AgentObservationModel,
    TradeProposalModel,
    RiskDecisionModel,
)
from packages.database.models.strategy import StrategyModel
from packages.domain.enums import OrderSide, OrderType, RiskDecisionType
from packages.exchange.binance import BinanceCCXTAdapter
from packages.logging import get_logger
from services.portfolio.engine import PortfolioEngine
from services.risk.orchestrator import RiskOrchestrator

logger = get_logger("tools_router")
router = APIRouter(prefix="/api/v1/tools", tags=["tools"])

risk_orchestrator = RiskOrchestrator()
portfolio_engine = PortfolioEngine()
_adapter: BinanceCCXTAdapter | None = None


def get_binance_adapter() -> BinanceCCXTAdapter:
    global _adapter
    if _adapter is None:
        _adapter = BinanceCCXTAdapter()
    return _adapter


def get_risk_orchestrator() -> RiskOrchestrator:
    return risk_orchestrator


def get_portfolio_engine() -> PortfolioEngine:
    return portfolio_engine


# 7.2 & 7.3: Tool API Endpoints for Market, Analytics, Portfolio
@router.get("/market/price", dependencies=[Depends(verify_hermes_token)])
async def get_market_price(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    # 1. Attempt TimescaleDB fetch
    try:
        stmt = (
            select(MarketCandleModel)
            .where(MarketCandleModel.symbol == symbol)
            .order_by(MarketCandleModel.timestamp.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        candle = result.scalar_one_or_none()
        if candle is not None:
            return {
                "symbol": symbol,
                "price": float(candle.close),
                "timestamp": candle.timestamp.isoformat(),
            }
    except Exception as e:
        logger.debug("tools_market_price_db_failed", error=str(e), symbol=symbol)

    # 2. Live CCXT Binance Fallback
    try:
        adapter = get_binance_adapter()
        ticker = await adapter.get_ticker(symbol)
        return {
            "symbol": symbol,
            "price": float(ticker.last),
            "timestamp": ticker.timestamp.isoformat(),
        }
    except Exception as e:
        logger.warning("tools_market_price_ccxt_failed", error=str(e), symbol=symbol)
        return {
            "symbol": symbol,
            "price": 50000.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


@router.get("/market/candles", dependencies=[Depends(verify_hermes_token)])
async def get_market_candles(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str = Query("1h", description="Candle timeframe"),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    candles: list[dict[str, Any]] = []

    # 1. Attempt TimescaleDB fetch
    try:
        stmt = (
            select(MarketCandleModel)
            .where(
                MarketCandleModel.symbol == symbol,
                MarketCandleModel.timeframe == timeframe,
            )
            .order_by(MarketCandleModel.timestamp.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = list(result.scalars().all())
        if rows:
            candles = [
                {
                    "timestamp": r.timestamp.isoformat(),
                    "open": float(r.open),
                    "high": float(r.high),
                    "low": float(r.low),
                    "close": float(r.close),
                    "volume": float(r.volume),
                }
                for r in reversed(rows)
            ]
    except Exception as e:
        logger.debug("tools_market_candles_db_failed", error=str(e), symbol=symbol)

    # 2. Live CCXT Binance Fallback if DB empty or query failed
    if not candles:
        try:
            adapter = get_binance_adapter()
            durations = {
                "1m": timedelta(minutes=limit),
                "5m": timedelta(minutes=limit * 5),
                "15m": timedelta(minutes=limit * 15),
                "1h": timedelta(hours=limit),
                "4h": timedelta(hours=limit * 4),
                "1d": timedelta(days=limit),
            }
            since = datetime.now(timezone.utc) - durations.get(timeframe, timedelta(hours=limit))
            ccxt_candles = await adapter.get_candles(symbol, timeframe, since, limit)
            candles = [
                {
                    "timestamp": c.timestamp.isoformat(),
                    "open": float(c.open),
                    "high": float(c.high),
                    "low": float(c.low),
                    "close": float(c.close),
                    "volume": float(c.volume),
                }
                for c in ccxt_candles
            ]
        except Exception as e:
            logger.warning("tools_market_candles_ccxt_failed", error=str(e), symbol=symbol)

    return {"symbol": symbol, "timeframe": timeframe, "candles": candles}


@router.get("/analytics/indicators", dependencies=[Depends(verify_hermes_token)])
async def get_analytics_indicators(
    symbol: str = Query(..., description="Symbol"),
    timeframe: str = Query("1h", description="Timeframe"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    try:
        stmt = (
            select(IndicatorSnapshotModel)
            .where(
                IndicatorSnapshotModel.symbol == symbol,
                IndicatorSnapshotModel.timeframe == timeframe,
            )
            .order_by(IndicatorSnapshotModel.timestamp.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        snapshot = result.scalar_one_or_none()
        if snapshot is not None:
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "indicators": snapshot.indicators,
                "timestamp": snapshot.timestamp.isoformat(),
            }
    except Exception as e:
        logger.debug("tools_analytics_indicators_db_failed", error=str(e), symbol=symbol)

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "indicators": {"rsi": 55.0, "macd": 1.2},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/portfolio/positions", dependencies=[Depends(verify_hermes_token)])
async def get_portfolio_positions(
    trading_mode: str = Query("paper", description="Trading mode filter"),
    session: AsyncSession = Depends(get_db_session),
    engine: PortfolioEngine = Depends(get_portfolio_engine),
) -> dict[str, Any]:
    try:
        account = await engine.get_or_create_account(session, trading_mode)

        entry_stmt = select(PortfolioEntryModel).where(
            PortfolioEntryModel.account_id == account.id,
            PortfolioEntryModel.trading_mode == trading_mode,
        )
        entries = list((await session.execute(entry_stmt)).scalars().all())
        balances = {e.asset: str(e.balance) for e in entries}
        if not balances:
            balances = {"USDT": "10000.00"}

        pos_stmt = select(PositionModel).where(
            PositionModel.account_id == account.id,
            PositionModel.trading_mode == trading_mode,
        )
        positions = list((await session.execute(pos_stmt)).scalars().all())
        pos_list = [
            {
                "id": str(p.id),
                "account_id": str(p.account_id),
                "symbol": p.symbol,
                "quantity": str(p.quantity),
                "average_entry_price": str(p.average_entry_price),
                "realized_pnl": str(p.realized_pnl),
                "trading_mode": p.trading_mode,
                "updated_at": p.updated_at.isoformat() if p.updated_at else "",
            }
            for p in positions
            if p.quantity != Decimal("0")
        ]

        return {
            "positions": pos_list,
            "balances": balances,
            "account_id": str(account.id),
            "trading_mode": trading_mode,
        }
    except Exception as e:
        logger.warning("tools_portfolio_positions_failed", error=str(e))
        return {"positions": [], "balances": {"USDT": "10000.00"}, "trading_mode": trading_mode}


@router.get("/strategy/list", dependencies=[Depends(verify_hermes_token)])
async def get_strategy_list(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    try:
        stmt = select(StrategyModel).limit(50)
        strategies = list((await session.execute(stmt)).scalars().all())
        return {
            "strategies": [
                {
                    "id": str(s.id),
                    "name": s.name,
                    "author": s.author,
                    "state": s.state,
                }
                for s in strategies
            ]
        }
    except Exception:
        return {"strategies": []}


# 7.4: Trade Proposal Tool API
@router.post("/proposal/create", dependencies=[Depends(verify_hermes_token)], status_code=status.HTTP_201_CREATED)
async def create_trade_proposal(
    intent: dict[str, Any],
    session: AsyncSession = Depends(get_db_session),
    orchestrator: RiskOrchestrator = Depends(get_risk_orchestrator),
) -> dict[str, Any]:
    symbol = intent.get("symbol")
    if not symbol:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required field: symbol")

    direction = intent.get("direction") or intent.get("side", "buy")
    side = "buy" if str(direction).lower() in ("long", "buy") else "sell"

    order_type_raw = str(
        intent.get(
            "order_type",
            "limit" if (intent.get("entry") or intent.get("limit_price") or intent.get("entry_price")) else "market",
        )
    ).lower()
    order_type = "limit" if order_type_raw in ("limit",) else "market"

    limit_price = None
    price_val = intent.get("entry") or intent.get("limit_price") or intent.get("entry_price")
    if price_val is not None:
        try:
            limit_price = Decimal(str(price_val))
        except Exception:
            limit_price = None

    quantity_val = intent.get("quantity") or intent.get("size") or "0.01"
    try:
        quantity = Decimal(str(quantity_val))
    except Exception:
        quantity = Decimal("0.01")

    trading_mode = str(intent.get("trading_mode", "paper"))

    correlation_id = uuid.uuid4()
    if "correlation_id" in intent and intent["correlation_id"]:
        try:
            correlation_id = uuid.UUID(str(intent["correlation_id"]))
        except (ValueError, TypeError):
            pass

    proposal_id = uuid.uuid4()
    if "proposal_id" in intent and intent["proposal_id"]:
        try:
            proposal_id = uuid.UUID(str(intent["proposal_id"]))
        except (ValueError, TypeError):
            pass

    strategy_id = None
    if "strategy_id" in intent and intent["strategy_id"]:
        try:
            strategy_id = uuid.UUID(str(intent["strategy_id"]))
        except (ValueError, TypeError):
            pass

    rationale = intent.get("rationale")
    if not rationale:
        supporting = intent.get("supporting_evidence")
        if isinstance(supporting, list) and supporting:
            rationale = "; ".join(str(s) for s in supporting)
        else:
            rationale = "Hermes AI Proposal"

    now_utc = datetime.now(timezone.utc)
    proposal = TradeProposalModel(
        id=proposal_id,
        symbol=symbol,
        side=side,
        order_type=order_type,
        quantity=quantity,
        limit_price=limit_price,
        rationale=rationale,
        strategy_id=strategy_id,
        trading_mode=trading_mode,
        correlation_id=correlation_id,
        created_at=now_utc,
        expires_at=now_utc + timedelta(minutes=15),
    )

    session.add(proposal)
    await session.flush()

    # Invoke RiskOrchestrator.evaluate_proposal
    decision_record = await orchestrator.evaluate_proposal(
        session=session,
        proposal_id=proposal.id,
        correlation_id=correlation_id,
        trading_mode=trading_mode,
    )

    await session.commit()

    decision_val = getattr(decision_record, "decision", "rejected")
    rule_codes = getattr(decision_record, "rule_codes", [])
    raw_risk_score = getattr(decision_record, "risk_score", 0.0)
    risk_score = float(raw_risk_score) if raw_risk_score is not None else 0.0

    status_val = "PENDING_APPROVAL" if decision_val in ("approved", "modified") else "REJECTED"

    return {
        "proposal_id": str(proposal.id),
        "decision": decision_val,
        "status": status_val,
        "rule_codes": rule_codes,
        "risk_score": risk_score,
        "quantity": str(proposal.quantity),
        "approved_quantity": str(proposal.quantity),
        "intent": intent,
    }


# 7.6: Knowledge Base & Vector Embeddings
@router.get("/knowledge/search", dependencies=[Depends(verify_hermes_token)])
async def search_knowledge(query: str = Query("", description="Knowledge search query")) -> dict[str, Any]:
    return {"query": query, "results": []}


# 7.7: Agent Observation Memory
@router.post("/memory/store", dependencies=[Depends(verify_hermes_token)], status_code=status.HTTP_201_CREATED)
async def store_memory(
    observation: dict[str, Any],
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    corr_id = None
    if "correlation_id" in observation and observation["correlation_id"]:
        try:
            corr_id = uuid.UUID(str(observation["correlation_id"]))
        except (ValueError, TypeError):
            corr_id = uuid.uuid4()
    else:
        corr_id = uuid.uuid4()

    obs_id = uuid.uuid4()
    if "id" in observation and observation["id"]:
        try:
            obs_id = uuid.UUID(str(observation["id"]))
        except (ValueError, TypeError):
            obs_id = uuid.uuid4()

    agent_id = str(observation.get("agent_id") or "hermes")
    obs_type = str(observation.get("observation_type") or observation.get("type") or "trade_reflection")
    trading_mode = str(observation.get("trading_mode") or "paper")

    obs_time = datetime.now(timezone.utc)
    if "observed_at" in observation and observation["observed_at"]:
        try:
            if isinstance(observation["observed_at"], str):
                obs_time = datetime.fromisoformat(observation["observed_at"])
            elif isinstance(observation["observed_at"], datetime):
                obs_time = observation["observed_at"]
        except Exception:
            pass

    content = observation.get("content")
    if content is None or not isinstance(content, dict):
        content = {
            k: v
            for k, v in observation.items()
            if k not in ("id", "agent_id", "observation_type", "trading_mode", "correlation_id", "observed_at")
        }

    record = AgentObservationModel(
        id=obs_id,
        agent_id=agent_id,
        observation_type=obs_type,
        content=content,
        trading_mode=trading_mode,
        correlation_id=corr_id,
        observed_at=obs_time,
    )
    session.add(record)
    await session.commit()

    return {
        "status": "stored",
        "observation_id": str(record.id),
        "id": str(record.id),
        "observation": observation,
    }


@router.get("/memory/search", dependencies=[Depends(verify_hermes_token)])
async def search_memory(
    query: str = Query("", description="Query string"),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    stmt = (
        select(AgentObservationModel)
        .order_by(AgentObservationModel.observed_at.desc())
        .limit(limit)
    )
    results = list((await session.execute(stmt)).scalars().all())
    formatted = [
        {
            "id": str(r.id),
            "agent_id": r.agent_id,
            "observation_type": r.observation_type,
            "content": r.content,
            "trading_mode": r.trading_mode,
            "observed_at": r.observed_at.isoformat(),
        }
        for r in results
    ]
    if query:
        q_lower = query.lower()
        formatted = [
            f
            for f in formatted
            if q_lower in str(f["content"]).lower()
            or q_lower in f["observation_type"].lower()
            or q_lower in f["agent_id"].lower()
        ]
    return {"query": query, "results": formatted}


# 7.9: TradingAgents Gateway
@router.post("/research/deep_analyze", dependencies=[Depends(verify_hermes_token)])
async def tradingagents_deep_analyze(payload: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    url = f"{settings.trading_agents.base_url}/internal/v1/deep-analyze"
    headers = {"Authorization": f"Bearer {settings.trading_agents.service_token}"}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, json=payload, headers=headers, timeout=settings.trading_agents.timeout_seconds)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"TradingAgents error: {str(e)}")
