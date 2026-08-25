import uuid
from collections.abc import Sequence
from datetime import datetime
from typing import Any, Self

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, String, Text, select
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from packages.database.base import Base


class TradingKnowledgeEmbedding(Base):
    """pgvector knowledge embedding table (PRD C9)."""

    __tablename__ = "trading_knowledge_embeddings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536), nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, nullable=False, default=dict)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    @classmethod
    async def nearest_neighbors(
        cls,
        session: AsyncSession,
        query_vector: list[float],
        limit: int = 5,
        trading_mode: str = "paper",
    ) -> Sequence[Self]:
        """Search nearest neighbor embeddings using cosine distance (<=>)."""
        stmt = (
            select(cls)
            .where(cls.trading_mode == trading_mode)
            .order_by(cls.embedding.cosine_distance(query_vector))
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()
