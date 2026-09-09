from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_hermes_token
from packages.database.engine import get_db_session
from packages.database.models.hypertables import MarketCandleModel
from packages.database.models.portfolio import (
    FillModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from packages.database.models.relational import OrderModel
from packages.exchange.binance import BinanceCCXTAdapter
from packages.logging import get_logger
from services.execution.paper import PaperExecutionAdapter
from services.portfolio.engine import PortfolioEngine

logger = get_logger("execution_tools_router")

router = APIRouter(
    prefix="/api/v1/tools/execution",
    tags=["execution-tools"],
    dependencies=[Depends(verify_hermes_token)],
)

position_router = APIRouter(
    prefix="/api/v1/tools/position",
    tags=["position-tools"],
    dependencies=[Depends(verify_hermes_token)],
)

portfolio_engine = PortfolioEngine()
_binance_adapter: BinanceCCXTAdapter | None = None


def get_binance_adapter() -> BinanceCCXTAdapter:
    global _binance_adapter
    if _binance_adapter is None:
        _binance_adapter = BinanceCCXTAdapter()
    return _binance_adapter


def get_live_adapter():
    return get_binance_adapter()


def get_exchange_adapter(market_type: str = "swap") -> BinanceCCXTAdapter:
    return BinanceCCXTAdapter(market_type=market_type)


async def _get_current_price(symbol: str, session: AsyncSession) -> Decimal:
    try:
        stmt = (
            select(MarketCandleModel)
            .where(MarketCandleModel.symbol == symbol)
            .order_by(MarketCandleModel.timestamp.desc())
            .limit(1)
        )
        res = await session.execute(stmt)
        candle = res.scalar_one_or_none()
        if candle is not None:
            return Decimal(str(candle.close))
    except Exception as e:
        logger.debug("execution_tools_price_db_failed", error=str(e), symbol=symbol)

    try:
        adapter = get_binance_adapter()
        ticker = await adapter.get_ticker(symbol)
        return Decimal(str(ticker.last))
    except Exception as e:
        logger.warning("execution_tools_price_ccxt_failed", error=str(e), symbol=symbol)

    return Decimal("0")


# ── Pydantic Request & Response Models ───────────────────────────────────────


class ExecutionRequest(BaseModel):
    symbol: str
    order_type: str
    side: str
    amount: Decimal
    price: Decimal | None = None
    leverage: int = 1
    reduce_only: bool = False
    market_type: str = "swap"  # spot or swap (for futures)


class ExecutionResponse(BaseModel):
    status: str
    exchange_order_id: str | None = None
    margin_used: Decimal | None = None
    error: str | None = None


class PlaceOrderRequest(BaseModel):
    symbol: str | None = None
    side: str | None = None
    order_type: str = "market"
    quantity: Decimal | None = None
    limit_price: Decimal | None = None
    trading_mode: str = "paper"
    correlation_id: str | None = None


class ClosePositionRequest(BaseModel):
    symbol: str
    trading_mode: str = "paper"
    order_type: str = "market"
    quantity: Decimal | None = None


# ── Execution Endpoints (/api/v1/tools/execution) ────────────────────────────


@router.get("/balance")
async def get_execution_balance(
    trading_mode: str = Query("paper"),
    asset: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Retrieve account balances for the given trading mode."""
    balances: dict[str, Any] = {}
    if trading_mode == "paper":
        account = await portfolio_engine.get_or_create_account(session, trading_mode)
        stmt = select(PortfolioEntryModel).where(
            PortfolioEntryModel.account_id == account.id,
            PortfolioEntryModel.trading_mode == trading_mode,
        )
        if asset:
            stmt = stmt.where(PortfolioEntryModel.asset == asset)
        entries = list((await session.execute(stmt)).scalars().all())
        for e in entries:
            balances[e.asset] = {
                "total": float(e.balance),
                "free": float(e.balance),
                "used": 0.0,
            }
    else:
        adapter = get_live_adapter()
        raw_bal = await adapter.get_portfolio()
        for k, v in raw_bal.items():
            if asset and k != asset:
                continue
            if isinstance(v, dict):
                balances[k] = {
                    "total": float(v.get("total", v.get("free", 0.0))),
                    "free": float(v.get("free", 0.0)),
                    "used": float(v.get("used", 0.0)),
                }
            else:
                balances[k] = {
                    "total": float(v),
                    "free": float(v),
                    "used": 0.0,
                }

    return {
        "trading_mode": trading_mode,
        "balances": balances,
    }


@router.get("/positions")
async def get_execution_positions(
    trading_mode: str = Query("paper"),
    symbol: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Retrieve open execution positions and unrealized PnL."""
    account = await portfolio_engine.get_or_create_account(session, trading_mode)
    stmt = select(PositionModel).where(
        PositionModel.account_id == account.id,
        PositionModel.trading_mode == trading_mode,
    )
    if symbol:
        stmt = stmt.where(PositionModel.symbol == symbol)
    positions = list((await session.execute(stmt)).scalars().all())

    pos_list: list[dict[str, Any]] = []
    for p in positions:
        if p.quantity == Decimal("0"):
            continue
        cur_price = await _get_current_price(p.symbol, session)
        unrealized = (cur_price - p.average_entry_price) * p.quantity
        pos_list.append({
            "id": str(p.id),
            "account_id": str(p.account_id),
            "symbol": p.symbol,
            "quantity": str(p.quantity),
            "average_entry_price": str(p.average_entry_price),
            "current_price": str(cur_price),
            "unrealized_pnl": str(unrealized),
            "realized_pnl": str(p.realized_pnl),
            "trading_mode": p.trading_mode,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None,
        })

    return {
        "trading_mode": trading_mode,
        "positions": pos_list,
    }


@router.get("/orders/open")
async def get_execution_open_orders(
    trading_mode: str = Query("paper"),
    symbol: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Retrieve active open orders."""
    stmt = select(OrderModel).where(
        OrderModel.trading_mode == trading_mode,
        OrderModel.status.in_(["OPEN", "PENDING", "SUBMITTED"]),
    )
    if symbol:
        stmt = stmt.where(OrderModel.symbol == symbol)
    orders = list((await session.execute(stmt)).scalars().all())

    return {
        "trading_mode": trading_mode,
        "count": len(orders),
        "orders": [
            {
                "id": str(o.id),
                "client_order_id": o.client_order_id,
                "symbol": o.symbol,
                "side": o.side,
                "order_type": o.order_type,
                "quantity": str(o.quantity),
                "filled_quantity": str(o.filled_quantity),
                "limit_price": str(o.limit_price) if o.limit_price is not None else None,
                "status": o.status,
                "trading_mode": o.trading_mode,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
    }


@router.post("/order", status_code=status.HTTP_201_CREATED)
async def place_execution_order(
    req: PlaceOrderRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Place a market or limit order with paper execution simulation."""
    if not req.symbol:
        raise HTTPException(status_code=400, detail="symbol is required")
    if not req.side or req.side.lower() not in ("buy", "sell"):
        raise HTTPException(status_code=400, detail="side must be buy or sell")
    ot_lower = (req.order_type or "market").lower()
    if ot_lower not in ("market", "limit"):
        raise HTTPException(status_code=400, detail="order_type must be market or limit")
    if req.quantity is None or req.quantity <= Decimal("0"):
        raise HTTPException(status_code=400, detail="quantity must be a positive number")
    if ot_lower == "limit" and (req.limit_price is None or req.limit_price <= Decimal("0")):
        raise HTTPException(status_code=400, detail="limit_price is required for limit orders")

    side_lower = req.side.lower()
    corr_uuid = uuid.UUID(req.correlation_id) if req.correlation_id else uuid.uuid4()
    order_id = uuid.uuid4()
    now_utc = datetime.now(UTC)

    order = OrderModel(
        id=order_id,
        execution_request_id=uuid.uuid4(),
        client_order_id=f"order_{uuid.uuid4().hex[:12]}",
        symbol=req.symbol,
        side=side_lower,
        order_type=ot_lower,
        quantity=req.quantity,
        filled_quantity=Decimal("0"),
        limit_price=req.limit_price,
        status="PENDING",
        trading_mode=req.trading_mode,
        correlation_id=corr_uuid,
        created_at=now_utc,
        updated_at=now_utc,
    )
    session.add(order)
    await session.flush()

    fills_list: list[dict[str, Any]] = []

    if req.trading_mode == "paper":
        paper_adapter = PaperExecutionAdapter(get_binance_adapter())

        if ot_lower == "market":
            raw_fill = await paper_adapter.execute_market_order(
                symbol=req.symbol,
                side=side_lower,
                quantity=req.quantity,
            )
            if raw_fill:
                raw_fill["order_id"] = order.id
                raw_fill["trading_mode"] = req.trading_mode
                raw_fill["correlation_id"] = corr_uuid
                await portfolio_engine.process_fill(
                    session=session,
                    fill_data=raw_fill,
                )
                order.status = "FILLED"
                order.filled_quantity = req.quantity
                order.updated_at = datetime.now(UTC)
                fills_list.append({
                    "id": str(raw_fill.get("id", uuid.uuid4())),
                    "exchange_trade_id": raw_fill.get("exchange_trade_id"),
                    "symbol": raw_fill.get("symbol", req.symbol),
                    "side": raw_fill.get("side", side_lower),
                    "price": str(raw_fill.get("price")),
                    "quantity": str(raw_fill.get("quantity")),
                    "fee": str(raw_fill.get("fee", 0)),
                    "fee_asset": raw_fill.get("fee_asset", "USDT"),
                    "executed_at": raw_fill.get("executed_at", datetime.now(UTC)).isoformat()
                    if isinstance(raw_fill.get("executed_at"), datetime)
                    else str(raw_fill.get("executed_at")),
                })
        elif ot_lower == "limit":
            assert req.limit_price is not None
            raw_fill = await paper_adapter.execute_limit_order(
                symbol=req.symbol,
                side=side_lower,
                quantity=req.quantity,
                limit_price=req.limit_price,
            )
            if raw_fill:
                raw_fill["order_id"] = order.id
                raw_fill["trading_mode"] = req.trading_mode
                raw_fill["correlation_id"] = corr_uuid
                await portfolio_engine.process_fill(
                    session=session,
                    fill_data=raw_fill,
                )
                order.status = "FILLED"
                order.filled_quantity = req.quantity
                order.updated_at = datetime.now(UTC)
                fills_list.append({
                    "id": str(raw_fill.get("id", uuid.uuid4())),
                    "exchange_trade_id": raw_fill.get("exchange_trade_id"),
                    "symbol": raw_fill.get("symbol", req.symbol),
                    "side": raw_fill.get("side", side_lower),
                    "price": str(raw_fill.get("price")),
                    "quantity": str(raw_fill.get("quantity")),
                    "fee": str(raw_fill.get("fee", 0)),
                    "fee_asset": raw_fill.get("fee_asset", "USDT"),
                    "executed_at": raw_fill.get("executed_at", datetime.now(UTC)).isoformat()
                    if isinstance(raw_fill.get("executed_at"), datetime)
                    else str(raw_fill.get("executed_at")),
                })
            else:
                order.status = "OPEN"
                order.filled_quantity = Decimal("0")
                order.updated_at = datetime.now(UTC)
    else:
        order.status = "OPEN"

    await session.commit()
    await session.refresh(order)

    return {
        "order_id": str(order.id),
        "client_order_id": order.client_order_id,
        "symbol": order.symbol,
        "side": order.side,
        "order_type": order.order_type,
        "quantity": str(order.quantity),
        "filled_quantity": str(order.filled_quantity),
        "status": order.status,
        "trading_mode": order.trading_mode,
        "fills": fills_list,
    }


@router.post("/orders/{order_id}/cancel")
async def cancel_execution_order(
    order_id: str,
    trading_mode: str = Query("paper"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Cancel an active open order."""
    try:
        parsed_uuid = uuid.UUID(order_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid order_id UUID") from exc

    stmt = select(OrderModel).where(OrderModel.id == parsed_uuid)
    res = await session.execute(stmt)
    order = res.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "FILLED":
        raise HTTPException(status_code=400, detail="Cannot cancel already filled order")

    order.status = "CANCELLED"
    order.updated_at = datetime.now(UTC)
    await session.commit()

    return {
        "order_id": str(order.id),
        "status": "CANCELLED",
        "client_order_id": order.client_order_id,
    }


@router.get("/orders/{order_id}")
async def get_execution_order(
    order_id: str,
    trading_mode: str = Query("paper"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Retrieve order status and fill records by order ID."""
    try:
        parsed_uuid = uuid.UUID(order_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid order_id UUID") from exc

    stmt = select(OrderModel).where(OrderModel.id == parsed_uuid)
    res = await session.execute(stmt)
    order = res.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    fill_stmt = select(FillModel).where(FillModel.order_id == order.id)
    fill_res = await session.execute(fill_stmt)
    fills = list(fill_res.scalars().all())

    return {
        "order_id": str(order.id),
        "client_order_id": order.client_order_id,
        "symbol": order.symbol,
        "side": order.side,
        "order_type": order.order_type,
        "quantity": str(order.quantity),
        "filled_quantity": str(order.filled_quantity),
        "limit_price": str(order.limit_price) if order.limit_price is not None else None,
        "status": order.status,
        "trading_mode": order.trading_mode,
        "fills": [
            {
                "id": str(f.id),
                "exchange_trade_id": f.exchange_trade_id,
                "price": str(f.price),
                "quantity": str(f.quantity),
                "fee": str(f.fee),
                "fee_asset": f.fee_asset,
                "executed_at": f.executed_at.isoformat() if f.executed_at else None,
            }
            for f in fills
        ],
    }


# ── Futures Margin & Order Execution (Phase 12) ──────────────────────────────


@router.post("/simulate_margin", response_model=dict[str, Any])
async def simulate_margin(request: ExecutionRequest):
    """Simulate the margin requirements for a futures order based on leverage."""
    if request.market_type != "swap":
        raise HTTPException(status_code=400, detail="Margin simulation is only applicable for futures (swap)")

    adapter = get_exchange_adapter(request.market_type)
    try:
        if request.price:
            exec_price = request.price
        else:
            ticker = await adapter.get_ticker(request.symbol)
            exec_price = ticker.last

        notional_value = exec_price * request.amount
        required_margin = notional_value / request.leverage

        return {
            "symbol": request.symbol,
            "exec_price_estimate": exec_price,
            "notional_value": notional_value,
            "leverage": request.leverage,
            "required_margin": required_margin,
            "reduce_only": request.reduce_only,
        }
    except Exception as e:
        logger.error(f"Error simulating margin: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/execute", response_model=ExecutionResponse)
async def execute_trade(request: ExecutionRequest):
    """Execute a futures or spot trade, handling leverage setting and reduce_only flags."""
    adapter = get_exchange_adapter(request.market_type)
    try:
        if request.market_type == "swap" and request.leverage > 1:
            await adapter.set_leverage(request.symbol, request.leverage)

        order_response = await adapter.create_order(
            symbol=request.symbol,
            order_type=request.order_type,
            side=request.side,
            amount=request.amount,
            price=request.price,
            reduce_only=request.reduce_only,
        )

        return ExecutionResponse(
            status="SUCCESS",
            exchange_order_id=str(order_response.get("id")),
        )
    except Exception as e:
        logger.error(f"Trade execution failed: {e}")
        return ExecutionResponse(status="FAILED", error=str(e))


# ── Position Manager Endpoints (/api/v1/tools/position) ──────────────────────


@position_router.get("")
async def get_position_endpoint(
    symbol: str = Query(...),
    trading_mode: str = Query("paper"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Retrieve current position status for a symbol."""
    account = await portfolio_engine.get_or_create_account(session, trading_mode)
    stmt = select(PositionModel).where(
        PositionModel.account_id == account.id,
        PositionModel.symbol == symbol,
        PositionModel.trading_mode == trading_mode,
    )
    res = await session.execute(stmt)
    pos = res.scalar_one_or_none()

    if pos is None or pos.quantity == Decimal("0"):
        return {
            "symbol": symbol,
            "quantity": "0",
            "status": "FLAT",
        }

    cur_price = await _get_current_price(symbol, session)
    entry_px = float(pos.average_entry_price)
    unrealized = (cur_price - pos.average_entry_price) * pos.quantity
    return_pct = round(((float(cur_price) - entry_px) / entry_px) * 100, 2) if entry_px > 0 else 0.0
    status_str = "LONG" if pos.quantity > Decimal("0") else "SHORT"

    return {
        "symbol": symbol,
        "quantity": str(pos.quantity),
        "average_entry_price": str(pos.average_entry_price),
        "current_price": str(cur_price),
        "unrealized_pnl": str(unrealized),
        "realized_pnl": str(pos.realized_pnl),
        "status": status_str,
        "return_pct": return_pct,
        "trading_mode": trading_mode,
    }


@position_router.get("/monitor")
async def monitor_positions_endpoint(
    trading_mode: str = Query("paper"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Monitor all active positions with live mark prices and totals."""
    account = await portfolio_engine.get_or_create_account(session, trading_mode)
    stmt = select(PositionModel).where(
        PositionModel.account_id == account.id,
        PositionModel.trading_mode == trading_mode,
    )
    positions = list((await session.execute(stmt)).scalars().all())
    active_positions = [p for p in positions if p.quantity != Decimal("0")]

    total_unrealized = Decimal("0")
    total_realized = Decimal("0")
    total_notional = Decimal("0")
    pos_details: list[dict[str, Any]] = []

    for p in active_positions:
        cur_price = await _get_current_price(p.symbol, session)
        unrealized = (cur_price - p.average_entry_price) * p.quantity
        notional = abs(cur_price * p.quantity)
        total_unrealized += unrealized
        total_realized += p.realized_pnl
        total_notional += notional
        pos_details.append({
            "symbol": p.symbol,
            "quantity": str(p.quantity),
            "average_entry_price": str(p.average_entry_price),
            "current_price": str(cur_price),
            "unrealized_pnl": str(unrealized),
            "realized_pnl": str(p.realized_pnl),
        })

    return {
        "trading_mode": trading_mode,
        "total_open_positions": len(active_positions),
        "total_unrealized_pnl": float(total_unrealized),
        "total_realized_pnl": float(total_realized),
        "total_notional_exposure": float(total_notional),
        "positions": pos_details,
    }


@position_router.post("/close")
async def close_position_endpoint(
    req: ClosePositionRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Close or reduce an active position."""
    account = await portfolio_engine.get_or_create_account(session, req.trading_mode)
    stmt = select(PositionModel).where(
        PositionModel.account_id == account.id,
        PositionModel.symbol == req.symbol,
        PositionModel.trading_mode == req.trading_mode,
    )
    res = await session.execute(stmt)
    pos = res.scalar_one_or_none()

    if pos is None or pos.quantity == Decimal("0"):
        raise HTTPException(status_code=400, detail="No active position found to close")

    close_qty = min(abs(pos.quantity), req.quantity) if req.quantity else abs(pos.quantity)
    side = "sell" if pos.quantity > Decimal("0") else "buy"

    if req.trading_mode == "paper":
        paper_adapter = PaperExecutionAdapter(get_binance_adapter())
        raw_fill = await paper_adapter.execute_market_order(
            symbol=req.symbol,
            side=side,
            quantity=close_qty,
        )
        if raw_fill:
            raw_fill["trading_mode"] = req.trading_mode
            await portfolio_engine.process_fill(
                session=session,
                fill_data=raw_fill,
                account_id=account.id,
            )

    await session.commit()
    res_updated = await session.execute(stmt)
    pos_after = res_updated.scalar_one()

    is_closed = (pos_after.quantity == Decimal("0"))
    return {
        "status": "CLOSED" if is_closed else "REDUCED",
        "symbol": req.symbol,
        "closed_quantity": str(close_qty),
        "remaining_quantity": str(pos_after.quantity),
        "realized_pnl": str(pos_after.realized_pnl),
    }


# ── Backwards Compatibility Legacy Router ─────────────────────────────────────

legacy_router = APIRouter(
    prefix="/api/v1/execution-tools",
    tags=["execution-tools-legacy"],
    dependencies=[Depends(verify_hermes_token)],
)
legacy_router.add_api_route("/simulate_margin", simulate_margin, methods=["POST"], response_model=dict[str, Any])
legacy_router.add_api_route("/execute", execute_trade, methods=["POST"], response_model=ExecutionResponse)
