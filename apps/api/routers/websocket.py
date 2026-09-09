from __future__ import annotations

import asyncio
import json
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from packages.config.settings import get_settings
from packages.auth.security import verify_session
import redis.asyncio as redis

router = APIRouter(prefix="/api/v1/ws", tags=["websocket"])
legacy_ws_router = APIRouter(tags=["websocket"])


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    session = websocket.cookies.get("session")

    if not session:
        await websocket.close(code=1008)
        return

    session_data = verify_session(session)
    if not session_data or session_data.get("role") != "owner":
        await websocket.close(code=1008)
        return

    settings = get_settings()
    r = redis.from_url(settings.redis.url)

    try:
        last_ids = {
            f"{settings.redis.key_prefix}market.tick": "$",
            f"{settings.redis.key_prefix}agent.log": "$",
            f"{settings.redis.key_prefix}proposal.new": "$",
            f"{settings.redis.key_prefix}portfolio.update": "$",
        }

        while True:
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                if msg == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                pass
            except WebSocketDisconnect:
                break

            try:
                streams = await r.xread(last_ids, block=1000)
            except Exception:
                await asyncio.sleep(0.5)
                continue

            if streams:
                for stream_name, messages in streams:
                    stream_str = stream_name.decode("utf-8") if isinstance(stream_name, bytes) else stream_name
                    for msg_id, msg_data in messages:
                        decoded_data = {
                            (k.decode("utf-8") if isinstance(k, bytes) else k): (
                                v.decode("utf-8") if isinstance(v, bytes) else v
                            )
                            for k, v in msg_data.items()
                        }

                        event_type = stream_str.split(":")[-1]

                        # Attempt to parse json fields in portfolio updates
                        if event_type == "portfolio.update":
                            for json_key in ("position", "fill", "balance"):
                                if json_key in decoded_data and isinstance(decoded_data[json_key], str):
                                    try:
                                        decoded_data[json_key] = json.loads(decoded_data[json_key])
                                    except Exception:
                                        pass

                        await websocket.send_json({
                            "type": event_type,
                            "data": decoded_data,
                        })
                        last_ids[stream_name] = msg_id

    except WebSocketDisconnect:
        pass
    finally:
        try:
            await r.aclose()
        except Exception:
            pass


async def handle_portfolio_websocket(websocket: WebSocket) -> None:
    """Shared handler for portfolio websocket subscriptions."""
    await websocket.accept()
    settings = get_settings()

    # Authentication validation
    session_cookie = websocket.cookies.get("session")
    token_param = websocket.query_params.get("token")

    app_env = getattr(settings.app, "env", "development")
    if app_env not in ("development", "test"):
        authenticated = False
        if session_cookie:
            session_data = verify_session(session_cookie)
            if session_data and session_data.get("role") == "owner":
                authenticated = True
        elif token_param and (token_param == settings.hermes.service_token or token_param == getattr(settings.auth, "dashboard_auth_secret", None)):
            authenticated = True

        if not authenticated:
            await websocket.close(code=1008)
            return

    # Attempt to send initial positions snapshot
    try:
        from packages.database.engine import get_engine, get_session_factory
        from packages.database.models.portfolio import PositionModel
        from sqlalchemy import select

        engine = get_engine(settings)
        session_factory = get_session_factory(engine)
        async with session_factory() as db_session:
            trading_mode = websocket.query_params.get("trading_mode", "paper")
            stmt = select(PositionModel).where(PositionModel.trading_mode == trading_mode)
            positions = list((await db_session.execute(stmt)).scalars().all())
            snapshot = [
                {
                    "id": str(p.id),
                    "account_id": str(p.account_id),
                    "symbol": p.symbol,
                    "side": "long" if p.quantity >= 0 else "short",
                    "quantity": float(p.quantity),
                    "entryPrice": float(p.average_entry_price),
                    "average_entry_price": str(p.average_entry_price),
                    "currentPrice": float(p.average_entry_price),
                    "realizedPnl": float(p.realized_pnl),
                    "realized_pnl": str(p.realized_pnl),
                    "trading_mode": p.trading_mode,
                    "updated_at": p.updated_at.isoformat() if p.updated_at else None,
                }
                for p in positions
            ]
            await websocket.send_json({
                "type": "positions_update",
                "positions": snapshot,
            })
    except Exception:
        # If DB query is not available (e.g. in standalone tests), send empty snapshot
        try:
            await websocket.send_json({
                "type": "positions_update",
                "positions": [],
            })
        except Exception:
            pass

    r = redis.from_url(settings.redis.url)
    stream_key = f"{settings.redis.key_prefix}portfolio.update"
    last_ids = {stream_key: "$"}

    try:
        while True:
            # Check for client messages
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                if msg == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                pass
            except WebSocketDisconnect:
                break

            try:
                streams = await r.xread(last_ids, block=1000)
            except Exception:
                await asyncio.sleep(0.5)
                continue

            if streams:
                for stream_name, messages in streams:
                    for msg_id, msg_data in messages:
                        decoded_data = {
                            (k.decode("utf-8") if isinstance(k, bytes) else k): (
                                v.decode("utf-8") if isinstance(v, bytes) else v
                            )
                            for k, v in msg_data.items()
                        }

                        pos_data = decoded_data.get("position")
                        if isinstance(pos_data, str):
                            try:
                                pos_data = json.loads(pos_data)
                            except Exception:
                                pass

                        fill_data = decoded_data.get("fill")
                        if isinstance(fill_data, str):
                            try:
                                fill_data = json.loads(fill_data)
                            except Exception:
                                pass

                        balance_data = decoded_data.get("balance")
                        if isinstance(balance_data, str):
                            try:
                                balance_data = json.loads(balance_data)
                            except Exception:
                                pass

                        event_type = decoded_data.get("type", "position_update")

                        out_msg = {
                            "type": event_type,
                            "event": decoded_data.get("event", "fill"),
                            "symbol": decoded_data.get("symbol"),
                            "side": decoded_data.get("side"),
                            "trading_mode": decoded_data.get("trading_mode"),
                            "position": pos_data,
                            "fill": fill_data,
                            "balance": balance_data,
                            "timestamp": decoded_data.get("timestamp"),
                        }

                        await websocket.send_json(out_msg)
                        last_ids[stream_name] = msg_id

    except WebSocketDisconnect:
        pass
    finally:
        try:
            await r.aclose()
        except Exception:
            pass


@router.websocket("/portfolio")
async def websocket_portfolio(websocket: WebSocket) -> None:
    """Dedicated portfolio real-time updates WebSocket endpoint."""
    await handle_portfolio_websocket(websocket)


# Compatibility aliases
@legacy_ws_router.websocket("/ws/positions")
async def websocket_positions_alias(websocket: WebSocket) -> None:
    await handle_portfolio_websocket(websocket)


@legacy_ws_router.websocket("/ws/v1/portfolio")
async def websocket_v1_portfolio_alias(websocket: WebSocket) -> None:
    await handle_portfolio_websocket(websocket)


@legacy_ws_router.websocket("/ws/portfolio")
async def websocket_portfolio_alias(websocket: WebSocket) -> None:
    await handle_portfolio_websocket(websocket)
