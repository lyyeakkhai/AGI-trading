from __future__ import annotations

import contextlib
import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import String, cast, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_hermes_token
from packages.config.settings import get_settings
from packages.database.engine import get_db_session
from packages.database.models.hypertables import IndicatorSnapshotModel, MarketCandleModel
from packages.database.models.portfolio import (
    PortfolioEntryModel,
    PositionModel,
)
from packages.database.models.relational import (
    AgentObservationModel,
    TradeProposalModel,
)
from packages.database.models.strategy import StrategyModel
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
    trading_mode: str = Query("paper", description="Trading mode filter"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    # 1. Attempt TimescaleDB fetch
    try:
        stmt = (
            select(MarketCandleModel)
            .where(
                MarketCandleModel.symbol == symbol,
                MarketCandleModel.trading_mode == trading_mode,
            )
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

    # Fail closed: do not return fabricated price
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"Market price unavailable for {symbol}",
    )


@router.get("/market/candles", dependencies=[Depends(verify_hermes_token)])
async def get_market_candles(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str = Query("1h", description="Candle timeframe"),
    limit: int = Query(100, ge=1, le=1000),
    start: datetime | None = Query(None, description="Start timestamp filter"),
    end: datetime | None = Query(None, description="End timestamp filter"),
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
        )
        if start is not None:
            stmt = stmt.where(MarketCandleModel.timestamp >= start)
        if end is not None:
            stmt = stmt.where(MarketCandleModel.timestamp <= end)
        stmt = stmt.order_by(MarketCandleModel.timestamp.desc()).limit(limit)

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
            since = start if start is not None else (datetime.now(UTC) - durations.get(timeframe, timedelta(hours=limit)))
            ccxt_candles = await adapter.get_candles(symbol, timeframe, since, limit, until=end)
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


@router.get("/market/ticker", dependencies=[Depends(verify_hermes_token)])
async def get_market_ticker(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    # 1. Check TimescaleDB recent candle
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
            try:
                adapter = get_binance_adapter()
                ticker = await adapter.get_ticker(symbol)
                return {
                    "symbol": symbol,
                    "bid": float(ticker.bid),
                    "ask": float(ticker.ask),
                    "last": float(ticker.last),
                    "volume": float(ticker.volume),
                    "timestamp": ticker.timestamp.isoformat(),
                }
            except Exception:
                return {
                    "symbol": symbol,
                    "bid": float(candle.close),
                    "ask": float(candle.close),
                    "last": float(candle.close),
                    "volume": float(candle.volume),
                    "timestamp": candle.timestamp.isoformat(),
                }
    except Exception as e:
        logger.debug("tools_market_ticker_db_failed", error=str(e), symbol=symbol)

    # 2. Live CCXT Binance Fallback
    try:
        adapter = get_binance_adapter()
        ticker = await adapter.get_ticker(symbol)
        return {
            "symbol": symbol,
            "bid": float(ticker.bid),
            "ask": float(ticker.ask),
            "last": float(ticker.last),
            "volume": float(ticker.volume),
            "timestamp": ticker.timestamp.isoformat(),
        }
    except Exception as e:
        logger.warning("tools_market_ticker_ccxt_failed", error=str(e), symbol=symbol)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Market ticker unavailable for {symbol}",
        )


@router.get("/market/order_book", dependencies=[Depends(verify_hermes_token)])
@router.get("/market/orderbook", dependencies=[Depends(verify_hermes_token)], include_in_schema=False)
async def get_market_order_book(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    depth: int = Query(20, ge=1, le=100, description="Order book depth"),
) -> dict[str, Any]:
    try:
        adapter = get_binance_adapter()
        ob = await adapter.get_order_book(symbol, depth)
        return {
            "symbol": ob.symbol,
            "timestamp": ob.timestamp.isoformat(),
            "bids": [[float(p), float(q)] for p, q in ob.bids[:depth]],
            "asks": [[float(p), float(q)] for p, q in ob.asks[:depth]],
        }
    except Exception as e:
        logger.warning("tools_market_order_book_failed", error=str(e), symbol=symbol)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Order book unavailable for {symbol}: {e}",
        )


@router.get("/market/trades", dependencies=[Depends(verify_hermes_token)])
async def get_market_trades(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    limit: int = Query(50, ge=1, le=200, description="Max trades to retrieve"),
    since: datetime | None = Query(None, description="Fetch trades starting from timestamp"),
) -> dict[str, Any]:
    try:
        adapter = get_binance_adapter()
        trades_since = since or (datetime.now(UTC) - timedelta(minutes=15))
        recent_trades = await adapter.get_recent_trades(symbol, trades_since, limit)
        return {
            "symbol": symbol,
            "trades": [
                {
                    "symbol": t.symbol,
                    "price": float(t.price),
                    "amount": float(t.amount),
                    "side": t.side,
                    "exchange_trade_id": t.exchange_trade_id,
                    "timestamp": t.timestamp.isoformat(),
                }
                for t in recent_trades
            ],
        }
    except Exception as e:
        logger.warning("tools_market_trades_failed", error=str(e), symbol=symbol)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Recent trades unavailable for {symbol}: {e}",
        )


@router.get("/market/volume", dependencies=[Depends(verify_hermes_token)])
async def get_market_volume(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
) -> dict[str, Any]:
    try:
        adapter = get_binance_adapter()
        vol = await adapter.get_volume(symbol)
        return {
            "symbol": vol.symbol,
            "base_volume": float(vol.base_volume),
            "quote_volume": float(vol.quote_volume),
            "timestamp": vol.timestamp.isoformat(),
        }
    except Exception as e:
        logger.warning("tools_market_volume_failed", error=str(e), symbol=symbol)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Volume data unavailable for {symbol}: {e}",
        )


@router.get("/market/funding_rate", dependencies=[Depends(verify_hermes_token)])
async def get_market_funding_rate(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
) -> dict[str, Any]:
    try:
        adapter = get_binance_adapter()
        fr = await adapter.get_funding_rate(symbol)
        return {
            "symbol": fr.symbol,
            "funding_rate": float(fr.funding_rate),
            "mark_price": float(fr.mark_price) if fr.mark_price is not None else None,
            "index_price": float(fr.index_price) if fr.index_price is not None else None,
            "next_funding_time": fr.next_funding_time.isoformat() if fr.next_funding_time else None,
            "timestamp": fr.timestamp.isoformat(),
        }
    except Exception as e:
        logger.warning("tools_market_funding_rate_failed", error=str(e), symbol=symbol)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Funding rate unavailable for {symbol}: {e}",
        )


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
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database error querying indicators for {symbol}",
        ) from e

    # Fail closed: indicators not found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Indicators not found for {symbol} ({timeframe})",
    )


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
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Portfolio engine unavailable",
        ) from e


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
@router.post(
    "/proposal/create",
    dependencies=[Depends(verify_hermes_token)],
    status_code=status.HTTP_201_CREATED,
)
async def create_trade_proposal(
    intent: dict[str, Any],
    session: AsyncSession = Depends(get_db_session),
    orchestrator: RiskOrchestrator = Depends(get_risk_orchestrator),
) -> dict[str, Any]:
    symbol = intent.get("symbol")
    if not symbol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required field: symbol"
        )

    direction = intent.get("direction") or intent.get("side", "buy")
    side = "buy" if str(direction).lower() in ("long", "buy") else "sell"

    order_type_raw = str(
        intent.get(
            "order_type",
            "limit"
            if (intent.get("entry") or intent.get("limit_price") or intent.get("entry_price"))
            else "market",
        )
    ).lower()
    order_type = "limit" if order_type_raw in ("limit",) else "market"

    quantity_val = intent.get("quantity") or intent.get("size")
    if quantity_val is None:
        quantity = Decimal("0.01")
    else:
        try:
            quantity = Decimal(str(quantity_val))
            if quantity <= Decimal("0"):
                raise ValueError()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid quantity: must be a positive number",
            ) from None

    limit_price = None
    price_val = intent.get("entry") or intent.get("limit_price") or intent.get("entry_price")
    if price_val is not None:
        try:
            limit_price = Decimal(str(price_val))
            if limit_price <= Decimal("0"):
                raise ValueError()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid limit_price: must be a positive number",
            ) from None
    elif order_type == "limit":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit orders require an entry or limit_price",
        )

    trading_mode = str(intent.get("trading_mode", "paper"))

    correlation_id = uuid.uuid4()
    if "correlation_id" in intent and intent["correlation_id"]:
        with contextlib.suppress(ValueError, TypeError):
            correlation_id = uuid.UUID(str(intent["correlation_id"]))

    proposal_id = uuid.uuid4()
    if "proposal_id" in intent and intent["proposal_id"]:
        with contextlib.suppress(ValueError, TypeError):
            proposal_id = uuid.UUID(str(intent["proposal_id"]))

    strategy_id = None
    if "strategy_id" in intent and intent["strategy_id"]:
        with contextlib.suppress(ValueError, TypeError):
            strategy_id = uuid.UUID(str(intent["strategy_id"]))

    rationale = intent.get("rationale")
    if not rationale:
        supporting = intent.get("supporting_evidence")
        if isinstance(supporting, list) and supporting:
            rationale = "; ".join(str(s) for s in supporting)
        else:
            rationale = "Hermes AI Proposal"

    now_utc = datetime.now(UTC)
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
    if decision_val == "rejected":
        approved_quantity = "0"
    elif decision_val == "modified":
        approved_quantity = str(getattr(decision_record, "approved_quantity", proposal.quantity))
    else:
        approved_quantity = str(proposal.quantity)

    return {
        "proposal_id": str(proposal.id),
        "decision": decision_val,
        "status": status_val,
        "rule_codes": rule_codes,
        "risk_score": risk_score,
        "quantity": str(proposal.quantity),
        "approved_quantity": approved_quantity,
        "intent": intent,
    }


# 7.6: Knowledge Base & Vector Embeddings
@router.get("/knowledge/search", dependencies=[Depends(verify_hermes_token)])
async def search_knowledge(
    query: str = Query("", description="Knowledge search query"),
) -> dict[str, Any]:
    return {"query": query, "results": []}


# 7.7: Agent Observation Memory
@router.post(
    "/memory/store",
    dependencies=[Depends(verify_hermes_token)],
    status_code=status.HTTP_201_CREATED,
)
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
    obs_type = str(
        observation.get("observation_type") or observation.get("type") or "trade_reflection"
    )
    trading_mode = str(observation.get("trading_mode") or "paper")

    obs_time = datetime.now(UTC)
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
            if k
            not in (
                "id",
                "agent_id",
                "observation_type",
                "trading_mode",
                "correlation_id",
                "observed_at",
            )
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
    stmt = select(AgentObservationModel)
    if query:
        search_pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                AgentObservationModel.agent_id.ilike(search_pattern),
                AgentObservationModel.observation_type.ilike(search_pattern),
                cast(AgentObservationModel.content, String).ilike(search_pattern),
            )
        )
    stmt = stmt.order_by(AgentObservationModel.observed_at.desc()).limit(limit)
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
    return {"query": query, "results": formatted}


# 7.9: TradingAgents Gateway
@router.post("/research/deep_analyze", dependencies=[Depends(verify_hermes_token)])
async def tradingagents_deep_analyze(payload: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    url = f"{settings.trading_agents.base_url}/internal/v1/deep-analyze"
    headers = {"Authorization": f"Bearer {settings.trading_agents.service_token}"}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                url, json=payload, headers=headers, timeout=settings.trading_agents.timeout_seconds
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"TradingAgents error: {str(e)}") from e


# ── Research Experiment Tools (Hermes integration boundary) ──────────────────
# These endpoints allow Hermes to read and create research experiments.
# Hermes interprets results — it does NOT calculate financial metrics.


@router.get("/research/experiments", dependencies=[Depends(verify_hermes_token)])
async def tool_list_experiments(
    status: str | None = Query(None),
    category: str | None = Query(None),
    asset: str | None = Query(None),
    limit: int = Query(20, le=100),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Hermes tool: list research experiments with optional filters."""
    from services.research.service import ResearchService

    svc = ResearchService(session)
    items = await svc.list_experiments(
        status=status, category=category, asset=asset, limit=limit
    )
    return {
        "experiments": [item.model_dump(mode="json") for item in items],
        "count": len(items),
    }


@router.get(
    "/research/experiments/{experiment_id}", dependencies=[Depends(verify_hermes_token)]
)
async def tool_get_experiment(
    experiment_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Hermes tool: retrieve full experiment detail for interpretation."""
    import uuid as _uuid

    from services.research.service import ResearchService

    try:
        eid = _uuid.UUID(experiment_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid experiment_id UUID") from exc

    svc = ResearchService(session)
    result = await svc.get_experiment(eid)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result.model_dump(mode="json")


@router.post(
    "/research/experiments",
    dependencies=[Depends(verify_hermes_token)],
    status_code=201,
)
async def tool_create_experiment(
    payload: dict[str, Any],
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Hermes tool: create a research experiment from a structured payload."""
    from packages.domain.experiment import CreateExperimentRequest
    from services.research.service import ResearchService

    try:
        req = CreateExperimentRequest.model_validate(payload)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    svc = ResearchService(session)
    result = await svc.create_experiment(req)
    return result.model_dump(mode="json")


@router.post(
    "/research/experiments/{experiment_id}/notes",
    dependencies=[Depends(verify_hermes_token)],
    status_code=201,
)
async def tool_add_research_note(
    experiment_id: str,
    payload: dict[str, Any],
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Hermes tool: add a research note to an experiment."""
    import uuid as _uuid

    from packages.domain.experiment import AddNoteRequest
    from services.research.service import ResearchService

    try:
        eid = _uuid.UUID(experiment_id)
        req = AddNoteRequest.model_validate(payload)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    svc = ResearchService(session)
    result = await svc.add_note(eid, req)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result.model_dump(mode="json")
