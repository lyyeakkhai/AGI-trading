import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from sqlalchemy import insert, select, text
from sqlalchemy.exc import IntegrityError

from packages.config import get_settings
from packages.database import AsyncSessionContext, get_engine, get_session_factory
from packages.database.models import (
    FillModel,
    IdempotencyKeyModel,
    OrderModel,
    PortfolioAccountModel,
)


@pytest.mark.integration
@pytest.mark.asyncio
async def test_migrate_to_head_is_idempotent() -> None:
    settings = get_settings()
    engine = get_engine(settings)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT version_num FROM alembic_version;"))
        version = result.scalar()
        assert version == "0004"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_unique_constraint_idempotency_keys() -> None:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    key_name = f"test_key_{uuid.uuid4()}"

    async with AsyncSessionContext(session_factory) as session:
        session.add(
            IdempotencyKeyModel(
                key=key_name,
                trading_mode="paper",
                outcome={"status": "ok"},
                created_at=datetime.now(timezone.utc),
            )
        )

    # Adding the same key and trading_mode should fail
    with pytest.raises(IntegrityError):
        async with AsyncSessionContext(session_factory) as session:
            session.add(
                IdempotencyKeyModel(
                    key=key_name,
                    trading_mode="paper",
                    outcome={"status": "duplicate"},
                    created_at=datetime.now(timezone.utc),
                )
            )

    # Adding the same key under 'live' trading mode is isolated and succeeds
    async with AsyncSessionContext(session_factory) as session:
        session.add(
            IdempotencyKeyModel(
                key=key_name,
                trading_mode="live",
                outcome={"status": "live_ok"},
                created_at=datetime.now(timezone.utc),
            )
        )


@pytest.mark.integration
@pytest.mark.asyncio
async def test_unique_constraint_fills() -> None:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)

    trade_id = f"trade_{uuid.uuid4()}"
    cid = uuid.uuid4()
    now = datetime.now(timezone.utc)

    async with AsyncSessionContext(session_factory) as session:
        order = OrderModel(
            id=uuid.uuid4(),
            execution_request_id=uuid.uuid4(),
            client_order_id=f"cli_{uuid.uuid4()}",
            symbol="BTC/USDT",
            side="buy",
            order_type="market",
            quantity=Decimal("1.0"),
            filled_quantity=Decimal("1.0"),
            status="filled",
            trading_mode="paper",
            correlation_id=cid,
            created_at=now,
            updated_at=now,
        )
        session.add(order)
        await session.flush()

        fill1 = FillModel(
            id=uuid.uuid4(),
            order_id=order.id,
            exchange_trade_id=trade_id,
            symbol="BTC/USDT",
            side="buy",
            quantity=Decimal("1.0"),
            price=Decimal("45000.0"),
            fee=Decimal("0.001"),
            fee_asset="BTC",
            trading_mode="paper",
            correlation_id=cid,
            executed_at=now,
        )
        session.add(fill1)

    # Inserting duplicate fill for same exchange_trade_id, symbol, trading_mode must fail
    with pytest.raises(IntegrityError):
        async with AsyncSessionContext(session_factory) as session:
            fill_dup = FillModel(
                id=uuid.uuid4(),
                order_id=order.id,
                exchange_trade_id=trade_id,
                symbol="BTC/USDT",
                side="buy",
                quantity=Decimal("1.0"),
                price=Decimal("45000.0"),
                fee=Decimal("0.001"),
                fee_asset="BTC",
                trading_mode="paper",
                correlation_id=cid,
                executed_at=now,
            )
            session.add(fill_dup)


@pytest.mark.integration
@pytest.mark.asyncio
async def test_hypertables_created() -> None:
    settings = get_settings()
    engine = get_engine(settings)
    async with engine.connect() as conn:
        result = await conn.execute(
            text(
                "SELECT hypertable_name FROM timescaledb_information.hypertables "
                "WHERE hypertable_name IN ('market_candles', 'market_trades', 'indicator_snapshots', "
                "'market_events', 'social_metrics', 'signal_events', 'portfolio_snapshots');"
            )
        )
        hypertables = {row[0] for row in result.fetchall()}
        expected = {
            "market_candles",
            "market_trades",
            "indicator_snapshots",
            "market_events",
            "social_metrics",
            "signal_events",
            "portfolio_snapshots",
        }
        assert expected.issubset(hypertables)
