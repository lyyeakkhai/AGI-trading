import uuid
from datetime import datetime, timezone

import pytest

from packages.config import get_settings
from packages.database import AsyncSessionContext, get_engine, get_session_factory
from packages.database.models.vectors import TradingKnowledgeEmbedding


@pytest.mark.integration
@pytest.mark.asyncio
async def test_nearest_neighbor_returns_closest_embedding() -> None:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)

    # 1536-dimensional vectors
    vec_target = [1.0] + [0.0] * 1535
    vec_close = [0.9] + [0.1] + [0.0] * 1534
    vec_far = [0.0] * 1535 + [1.0]

    now = datetime.now(timezone.utc)
    id1 = uuid.uuid4()
    id2 = uuid.uuid4()

    async with AsyncSessionContext(session_factory) as session:
        emb_close = TradingKnowledgeEmbedding(
            id=id1,
            content="Close matching strategy insight",
            embedding=vec_close,
            metadata_={"tag": "close"},
            source="manual",
            trading_mode="paper",
            created_at=now,
        )
        emb_far = TradingKnowledgeEmbedding(
            id=id2,
            content="Far unrelated knowledge",
            embedding=vec_far,
            metadata_={"tag": "far"},
            source="manual",
            trading_mode="paper",
            created_at=now,
        )
        session.add_all([emb_close, emb_far])

    async with AsyncSessionContext(session_factory) as session:
        results = await TradingKnowledgeEmbedding.nearest_neighbors(
            session=session,
            query_vector=vec_target,
            limit=1,
            trading_mode="paper",
        )
        assert len(results) == 1
        assert results[0].id == id1
