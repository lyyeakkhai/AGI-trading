"""create intelligence tables

Revision ID: 0005
Revises: 0004
Create Date: 2026-08-26 00:00:00.000000+00:00
"""
from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. news_events
    op.create_table(
        "news_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("headline", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("assets", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("category", sa.String(50), nullable=False, server_default="general"),
        sa.Column("importance", sa.String(20), nullable=False, server_default="LOW"),
        sa.Column("sentiment_score", sa.Numeric(10, 4), nullable=True),
        sa.Column("source_url", sa.String(500), nullable=True),
        sa.Column("metadata_payload", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("trading_mode", sa.String(10), nullable=False, server_default="paper"),
        sa.PrimaryKeyConstraint("id", "timestamp", name="pk_news_events"),
    )
    op.execute(
        "SELECT create_hypertable('news_events', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);"
    )

    # 2. event_correlations
    op.create_table(
        "event_correlations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("correlation_type", sa.String(50), nullable=False),
        sa.Column("social_velocity", sa.Numeric(10, 4), nullable=False),
        sa.Column("volume_change", sa.Numeric(10, 4), nullable=False),
        sa.Column("price_change", sa.Numeric(10, 4), nullable=True),
        sa.Column("details", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("trading_mode", sa.String(10), nullable=False, server_default="paper"),
        sa.PrimaryKeyConstraint("id", "timestamp", name="pk_event_correlations"),
    )
    op.execute(
        "SELECT create_hypertable('event_correlations', 'timestamp', "
        "chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);"
    )


def downgrade() -> None:
    op.drop_table("event_correlations")
    op.drop_table("news_events")
