"""create hypertables

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-25 00:00:00.000000+00:00

"""
from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. market_candles
    op.create_table(
        "market_candles",
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("timeframe", sa.String(5), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("open", sa.Numeric(20, 8), nullable=False),
        sa.Column("high", sa.Numeric(20, 8), nullable=False),
        sa.Column("low", sa.Numeric(20, 8), nullable=False),
        sa.Column("close", sa.Numeric(20, 8), nullable=False),
        sa.Column("volume", sa.Numeric(20, 8), nullable=False),
        sa.Column("is_closed", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("trading_mode", sa.String(10), nullable=False),
        sa.PrimaryKeyConstraint("symbol", "timeframe", "timestamp", name="pk_market_candles"),
    )
    op.execute(
        "SELECT create_hypertable('market_candles', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);"
    )

    # 2. market_trades
    op.create_table(
        "market_trades",
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("price", sa.Numeric(20, 8), nullable=False),
        sa.Column("amount", sa.Numeric(20, 8), nullable=False),
        sa.Column("side", sa.String(10), nullable=False),
        sa.Column("exchange_trade_id", sa.String(64), nullable=False),
        sa.Column("trading_mode", sa.String(10), nullable=False),
        sa.PrimaryKeyConstraint(
            "symbol", "exchange_trade_id", "trading_mode", "timestamp", name="pk_market_trades"
        ),
    )
    op.execute(
        "SELECT create_hypertable('market_trades', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);"
    )

    # 3. indicator_snapshots
    op.create_table(
        "indicator_snapshots",
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("timeframe", sa.String(5), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("indicators", postgresql.JSONB, nullable=False),
        sa.Column("trading_mode", sa.String(10), nullable=False),
        sa.PrimaryKeyConstraint("symbol", "timeframe", "timestamp", name="pk_indicator_snapshots"),
    )
    op.execute(
        "SELECT create_hypertable('indicator_snapshots', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);"
    )

    # 4. market_events
    op.create_table(
        "market_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("payload", postgresql.JSONB, nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("trading_mode", sa.String(10), nullable=False),
        sa.PrimaryKeyConstraint("id", "timestamp", name="pk_market_events"),
    )
    op.execute(
        "SELECT create_hypertable('market_events', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);"
    )

    # 5. social_metrics (C7 fix: window column, NOT separate tables)
    op.create_table(
        "social_metrics",
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window", sa.String(10), nullable=False),
        sa.Column("sentiment_score", sa.Numeric(10, 4), nullable=False),
        sa.Column("volume_mentions", sa.Integer, nullable=False),
        sa.Column("source", sa.String(50), nullable=False),
        sa.PrimaryKeyConstraint("symbol", "window", "source", "timestamp", name="pk_social_metrics"),
    )
    op.execute(
        "SELECT create_hypertable('social_metrics', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);"
    )

    # 6. signal_events
    op.create_table(
        "signal_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("signal_type", sa.String(50), nullable=False),
        sa.Column("confidence", sa.Numeric(10, 4), nullable=False),
        sa.Column("payload", postgresql.JSONB, nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("trading_mode", sa.String(10), nullable=False),
        sa.PrimaryKeyConstraint("id", "timestamp", name="pk_signal_events"),
    )
    op.execute(
        "SELECT create_hypertable('signal_events', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);"
    )

    # 7. portfolio_snapshots
    op.create_table(
        "portfolio_snapshots",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("total_equity", sa.Numeric(20, 8), nullable=False),
        sa.Column("cash_balance", sa.Numeric(20, 8), nullable=False),
        sa.Column("unrealized_pnl", sa.Numeric(20, 8), nullable=False),
        sa.Column("exposure", sa.Numeric(20, 8), nullable=False),
        sa.Column("trading_mode", sa.String(10), nullable=False),
        sa.PrimaryKeyConstraint("account_id", "timestamp", name="pk_portfolio_snapshots"),
    )
    op.execute(
        "SELECT create_hypertable('portfolio_snapshots', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);"
    )


def downgrade() -> None:
    op.drop_table("portfolio_snapshots")
    op.drop_table("signal_events")
    op.drop_table("social_metrics")
    op.drop_table("market_events")
    op.drop_table("indicator_snapshots")
    op.drop_table("market_trades")
    op.drop_table("market_candles")
