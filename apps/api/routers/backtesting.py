from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# We assume get_session is available in apps.api.dependencies or similar, we mock here
# For the purpose of Foundation 6, we'll just import it if it exists or mock
try:
    from apps.api.dependencies import get_session
except ImportError:
    # mock
    async def get_session():
        yield None

from services.backtesting.registry import StrategyRegistry
from packages.domain.strategy import StrategyParameters, StrategyState
from packages.database.models.backtest import BacktestJobModel, BacktestResultModel
from packages.database.models.strategy import StrategyModel, StrategyVersionModel

router = APIRouter(prefix="/api/v1", tags=["backtesting"])

class CreateStrategyRequest(BaseModel):
    name: str
    author: str
    description: Optional[str] = None

class CreateStrategyResponse(BaseModel):
    id: UUID
    name: str
    state: str

class AddVersionRequest(BaseModel):
    parameters: dict[str, Any]
    code_reference: str
    description: Optional[str] = None

class QueueBacktestRequest(BaseModel):
    strategy_version_id: UUID
    parameters: dict[str, Any] = {}

class QueueBacktestResponse(BaseModel):
    job_id: UUID
    status: str

@router.post("/strategies", response_model=CreateStrategyResponse, status_code=status.HTTP_201_CREATED)
async def create_strategy(request: CreateStrategyRequest, session: AsyncSession = Depends(get_session)):
    registry = StrategyRegistry(session)
    strategy = await registry.create_strategy(
        name=request.name,
        author=request.author,
        description=request.description
    )
    return CreateStrategyResponse(id=strategy.id, name=strategy.name, state=strategy.state)

@router.post("/strategies/{strategy_id}/versions", status_code=status.HTTP_201_CREATED)
async def add_strategy_version(strategy_id: UUID, request: AddVersionRequest, session: AsyncSession = Depends(get_session)):
    registry = StrategyRegistry(session)
    # verify strategy exists
    strategy = await registry.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
        
    params = StrategyParameters(parameters=request.parameters)
    version = await registry.add_version(
        strategy_id=strategy_id,
        parameters=params,
        code_reference=request.code_reference,
        description=request.description
    )
    return {"id": version.id, "version": version.version}

@router.post("/backtests", response_model=QueueBacktestResponse, status_code=status.HTTP_202_ACCEPTED)
async def queue_backtest(request: QueueBacktestRequest, session: AsyncSession = Depends(get_session)):
    job_id = uuid.uuid4()
    job = BacktestJobModel(
        id=job_id,
        strategy_version_id=request.strategy_version_id,
        parameters=request.parameters,
        status="PENDING"
    )
    session.add(job)
    await session.commit()
    
    # In a real app we'd dispatch to celery or background task here
    
    return QueueBacktestResponse(job_id=job_id, status="PENDING")

@router.get("/backtests/{job_id}")
async def get_backtest(job_id: UUID, session: AsyncSession = Depends(get_session)):
    stmt = select(BacktestJobModel).where(BacktestJobModel.id == job_id)
    result = await session.execute(stmt)
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Backtest job not found")
        
    response = {
        "id": job.id,
        "status": job.status,
        "started_at": job.started_at,
        "completed_at": job.completed_at
    }
    
    if job.status == "COMPLETED":
        stmt_res = select(BacktestResultModel).where(BacktestResultModel.job_id == job_id)
        result_res = await session.execute(stmt_res)
        bt_result = result_res.scalar_one_or_none()
        if bt_result:
            response["metrics"] = bt_result.metrics
            response["equity_curve"] = bt_result.equity_curve
            
    return response
