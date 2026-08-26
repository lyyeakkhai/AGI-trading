import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from packages.domain.strategy import StrategyState, StrategyVersion, StrategyParameters
from packages.database.models.strategy import StrategyModel, StrategyVersionModel


class StrategyRegistry:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_strategy(self, name: str, author: str, description: Optional[str] = None) -> StrategyModel:
        strategy = StrategyModel(
            id=uuid.uuid4(),
            name=name,
            author=author,
            description=description,
            state=StrategyState.DRAFT.value
        )
        self.session.add(strategy)
        await self.session.commit()
        await self.session.refresh(strategy)
        return strategy

    async def add_version(
        self,
        strategy_id: uuid.UUID,
        parameters: StrategyParameters,
        code_reference: str,
        description: Optional[str] = None
    ) -> StrategyVersionModel:
        # Get latest version
        stmt = select(StrategyVersionModel).where(
            StrategyVersionModel.strategy_id == strategy_id
        ).order_by(desc(StrategyVersionModel.version)).limit(1)
        
        result = await self.session.execute(stmt)
        latest = result.scalar_one_or_none()
        next_version = 1 if latest is None else latest.version + 1
        
        version_model = StrategyVersionModel(
            id=uuid.uuid4(),
            strategy_id=strategy_id,
            version=next_version,
            parameters=parameters.model_dump()["parameters"],
            code_reference=code_reference,
            description=description
        )
        self.session.add(version_model)
        await self.session.commit()
        await self.session.refresh(version_model)
        return version_model

    async def update_state(self, strategy_id: uuid.UUID, new_state: StrategyState) -> Optional[StrategyModel]:
        stmt = select(StrategyModel).where(StrategyModel.id == strategy_id)
        result = await self.session.execute(stmt)
        strategy = result.scalar_one_or_none()
        
        if strategy:
            strategy.state = new_state.value
            await self.session.commit()
            await self.session.refresh(strategy)
            
        return strategy

    async def get_strategy(self, strategy_id: uuid.UUID) -> Optional[StrategyModel]:
        stmt = select(StrategyModel).where(StrategyModel.id == strategy_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
        
    async def get_version(self, version_id: uuid.UUID) -> Optional[StrategyVersionModel]:
        stmt = select(StrategyVersionModel).where(StrategyVersionModel.id == version_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
