import uuid
import asyncio
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from packages.database.models.backtest import BacktestJobModel, BacktestResultModel
from services.backtesting.engine import EventDrivenBacktester
from packages.quant.metrics import calculate_performance_metrics

logger = logging.getLogger(__name__)

class BacktestWorker:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def process_job(self, job_id: uuid.UUID):
        stmt = select(BacktestJobModel).where(BacktestJobModel.id == job_id)
        result = await self.session.execute(stmt)
        job = result.scalar_one_or_none()

        if not job or job.status != "PENDING":
            return

        job.status = "RUNNING"
        job.started_at = datetime.utcnow()
        await self.session.commit()

        try:
            # Here we would load strategy and data
            # For now, it's a mock implementation as real strategy/data loading depends on F8
            candles = [] # Mock candles
            def mock_strategy(history): return []

            engine = EventDrivenBacktester(
                strategy_func=mock_strategy,
                candles=candles
            )
            
            # Execute simulation (could be blocking so run in executor)
            await asyncio.to_thread(engine.run)
            
            metrics = calculate_performance_metrics(engine.equity_curve, engine.trade_pnls)

            result_model = BacktestResultModel(
                id=uuid.uuid4(),
                job_id=job.id,
                metrics=metrics,
                equity_curve=[float(x) for x in engine.equity_curve],
                trade_logs=engine.trades
            )
            self.session.add(result_model)
            
            job.status = "COMPLETED"
            job.completed_at = datetime.utcnow()
            await self.session.commit()
            
        except Exception as e:
            logger.error(f"Backtest {job_id} failed: {e}")
            job.status = "FAILED"
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            await self.session.commit()
