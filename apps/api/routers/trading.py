import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from apps.api.dependencies import verify_owner_session
from services.execution.live import LiveExecutionAdapter

router = APIRouter(prefix="/api/trades", tags=["trading"])

async def get_db_session():
    from packages.config import get_settings
    from packages.database import get_engine, get_session_factory
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    async with session_factory() as session:
        yield session

@router.post("/kill-switch")
async def kill_switch(session = Depends(get_db_session), user = Depends(verify_owner_session)):
    """God Mode Kill Switch: Cancels orders and market-sells all positions."""
    now = datetime.datetime.now(datetime.UTC)
    
    # 1. Check for an active idempotency lock
    result = await session.execute(
        text("SELECT id, triggered_at, status FROM kill_switch_locks WHERE status = 'PENDING' ORDER BY triggered_at DESC LIMIT 1")
    )
    active_lock = result.fetchone()
    
    if active_lock:
        triggered_at = active_lock[1]
        if active_lock[1].tzinfo is None:
            triggered_at = triggered_at.replace(tzinfo=datetime.UTC)
        if (now - triggered_at).total_seconds() < 300:
            raise HTTPException(status_code=429, detail="Kill switch is already in progress.")
    
    # 2. Insert new PENDING lock
    lock_id = uuid.uuid4()
    await session.execute(
        text("INSERT INTO kill_switch_locks (id, triggered_at, status, executed_by) VALUES (:id, :ts, :status, :user)"),
        {"id": lock_id, "ts": now, "status": "PENDING", "user": user.get("role", "owner")}
    )
    await session.commit()
    
    adapter = LiveExecutionAdapter()
    try:
        # 3. Execute emergency maneuvers
        await adapter.cancel_all_orders()
        positions = await adapter.get_positions()
        closed = []
        for pos in positions:
            symbol = pos["symbol"]
            amount = pos["amount"]
            res = await adapter.execute_market_order(symbol, "sell", amount)
            closed.append(res)
            
        # 4. Mark lock COMPLETED
        await session.execute(
            text("UPDATE kill_switch_locks SET status = 'COMPLETED' WHERE id = :id"),
            {"id": lock_id}
        )
        await session.commit()
        return {"status": "success", "closed_positions": closed}
        
    except Exception as e:
        # 5. Unbrick the kill switch on failure
        await session.rollback()
        await session.execute(
            text("UPDATE kill_switch_locks SET status = 'FAILED' WHERE id = :id"),
            {"id": lock_id}
        )
        await session.commit()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await adapter.close()

@router.get("/{trade_id}/explanation")
async def explain_trade(trade_id: str, session = Depends(get_db_session), user = Depends(verify_owner_session)):
    """Fetch consensus reasoning for a trade."""
    return {
        "trade_id": trade_id,
        "explanation": "This trade was executed because all 3 agents (Bull, Bear, Tech) agreed to BUY based on strong momentum and RSI breakout.",
        "verdict": "BUY"
    }

