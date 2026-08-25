"""create vector table

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-25 00:00:00.000000+00:00

"""
from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. trading_knowledge_embeddings table (PRD C9)
    op.create_table(
        "trading_knowledge_embeddings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("embedding", Vector(1536), nullable=False),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("source", sa.String(100), nullable=False),
        sa.Column("trading_mode", sa.String(10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 2. HNSW index with cosine distance
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_trading_knowledge_embeddings_hnsw "
        "ON trading_knowledge_embeddings USING hnsw (embedding vector_cosine_ops);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_trading_knowledge_embeddings_hnsw;")
    op.drop_table("trading_knowledge_embeddings")
