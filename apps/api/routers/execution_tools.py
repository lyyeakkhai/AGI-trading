from __future__ import annotations

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from apps.api.dependencies import verify_hermes_token
from packages.exchange.binance import BinanceCCXTAdapter
from packages.logging import get_logger

logger = get_logger("execution_tools_router")
router = APIRouter(prefix="/api/v1/execution-tools", tags=["execution-tools"])

class ExecutionRequest(BaseModel):
    symbol: str
    order_type: str
    side: str
    amount: Decimal
    price: Decimal | None = None
    leverage: int = 1
    reduce_only: bool = False
    market_type: str = "swap"  # 'spot' or 'swap' (for futures)

class ExecutionResponse(BaseModel):
    status: str
    exchange_order_id: str | None = None
    margin_used: Decimal | None = None
    error: str | None = None

def get_exchange_adapter(market_type: str) -> BinanceCCXTAdapter:
    # In production, keys would be injected or loaded from secrets
    return BinanceCCXTAdapter(market_type=market_type)

@router.post("/simulate_margin", response_model=dict[str, Any], dependencies=[Depends(verify_hermes_token)])
async def simulate_margin(request: ExecutionRequest):
    """
    Simulate the margin requirements for a futures order based on leverage.
    """
    if request.market_type != "swap":
        raise HTTPException(status_code=400, detail="Margin simulation is only applicable for futures (swap)")
    
    adapter = get_exchange_adapter(request.market_type)
    
    try:
        # Estimate execution price if market order
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
            "reduce_only": request.reduce_only
        }
    except Exception as e:
        logger.error(f"Error simulating margin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute", response_model=ExecutionResponse, dependencies=[Depends(verify_hermes_token)])
async def execute_trade(request: ExecutionRequest):
    """
    Execute a futures or spot trade, handling leverage setting and reduce_only flags.
    """
    adapter = get_exchange_adapter(request.market_type)
    try:
        # If futures, set leverage first
        if request.market_type == "swap" and request.leverage > 1:
            await adapter.set_leverage(request.symbol, request.leverage)
            
        # Execute order
        order_response = await adapter.create_order(
            symbol=request.symbol,
            order_type=request.order_type,
            side=request.side,
            amount=request.amount,
            price=request.price,
            reduce_only=request.reduce_only
        )
        
        return ExecutionResponse(
            status="SUCCESS",
            exchange_order_id=str(order_response.get("id"))
        )
    except Exception as e:
        logger.error(f"Trade execution failed: {e}")
        return ExecutionResponse(status="FAILED", error=str(e))
