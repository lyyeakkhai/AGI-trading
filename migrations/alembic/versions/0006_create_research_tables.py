"""create research experiment tables

Revision ID: 0006
Revises: 9193a30ddbbf
Create Date: 2026-09-08 00:00:00.000000+00:00

"""
from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0006"
down_revision: Union[str, None] = "9193a30ddbbf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. research_experiments — core experiment record
    op.create_table(
        "research_experiments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("experiment_id", sa.String(20), nullable=False, unique=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="DRAFT"),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("asset", sa.String(20), nullable=True),
        sa.Column("timeframe", sa.String(10), nullable=True),
        sa.Column("hypothesis", postgresql.JSONB, nullable=False),
        sa.Column("config", postgresql.JSONB, nullable=True),
        sa.Column("dataset", postgresql.JSONB, nullable=True),
        sa.Column("conclusion", postgresql.JSONB, nullable=True),
        sa.Column("conclusion_outcome", sa.String(50), nullable=True),
        sa.Column("tags", postgresql.JSONB, nullable=False, server_default="'[]'::jsonb"),
        sa.Column("sequence_number", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Indexes for common research queries
    op.create_index("ix_research_experiments_status", "research_experiments", ["status"])
    op.create_index("ix_research_experiments_category", "research_experiments", ["category"])
    op.create_index("ix_research_experiments_asset", "research_experiments", ["asset"])
    op.create_index("ix_research_experiments_timeframe", "research_experiments", ["timeframe"])
    op.create_index(
        "ix_research_experiments_conclusion_outcome",
        "research_experiments",
        ["conclusion_outcome"],
    )
    op.create_index("ix_research_experiments_created_at", "research_experiments", ["created_at"])

    # 2. research_validation_runs — one per validation type per experiment
    op.create_table(
        "research_validation_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "experiment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_experiments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("run_type", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("config", postgresql.JSONB, nullable=False, server_default="'{}'::jsonb"),
        sa.Column("metrics", postgresql.JSONB, nullable=True),
        sa.Column("passed", sa.Boolean, nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("backtest_job_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index(
        "ix_research_vr_experiment_id", "research_validation_runs", ["experiment_id"]
    )
    op.create_index("ix_research_vr_run_type", "research_validation_runs", ["run_type"])

    # 3. research_notes — timestamped structured notes
    op.create_table(
        "research_notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "experiment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_experiments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("note_type", sa.String(50), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("stage", sa.String(50), nullable=True),
        sa.Column("author", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index("ix_research_notes_experiment_id", "research_notes", ["experiment_id"])
    op.create_index("ix_research_notes_note_type", "research_notes", ["note_type"])

    # 4. experiment_links — research lineage
    op.create_table(
        "experiment_links",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "parent_experiment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_experiments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "child_experiment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("research_experiments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("link_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index("ix_experiment_links_parent", "experiment_links", ["parent_experiment_id"])
    op.create_index("ix_experiment_links_child", "experiment_links", ["child_experiment_id"])


def downgrade() -> None:
    op.drop_table("experiment_links")
    op.drop_table("research_notes")
    op.drop_table("research_validation_runs")
    op.drop_table("research_experiments")
