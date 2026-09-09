"""SQLAlchemy ORM models for the Research Experiment System."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from packages.database.base import Base


class ResearchExperimentModel(Base):
    """Core experiment record."""

    __tablename__ = "research_experiments"
    __table_args__ = (
        Index("ix_research_experiments_status", "status"),
        Index("ix_research_experiments_category", "category"),
        Index("ix_research_experiments_asset", "asset"),
        Index("ix_research_experiments_timeframe", "timeframe"),
        Index("ix_research_experiments_conclusion_outcome", "conclusion_outcome"),
        Index("ix_research_experiments_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Human-readable sequential slug e.g. EXP-001
    experiment_id: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="DRAFT")

    # Research classification (denormalised for query performance)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    asset: Mapped[str | None] = mapped_column(String(20), nullable=True)
    timeframe: Mapped[str | None] = mapped_column(String(10), nullable=True)

    # JSONB fields — all structured, never free-form AI blobs
    hypothesis: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    config: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    dataset: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    conclusion: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    conclusion_outcome: Mapped[str | None] = mapped_column(String(50), nullable=True)

    tags: Mapped[list[Any]] = mapped_column(JSONB, nullable=False, default=list)

    # Sequence counter used to generate experiment_id slug
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class ValidationRunModel(Base):
    """A single validation run (BACKTEST / OOS / WF / REGIME_ANALYSIS)."""

    __tablename__ = "research_validation_runs"
    __table_args__ = (
        Index("ix_research_vr_experiment_id", "experiment_id"),
        Index("ix_research_vr_run_type", "run_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    experiment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("research_experiments.id", ondelete="CASCADE"),
        nullable=False,
    )
    run_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Run-level configuration overrides (nullable — may inherit from experiment)
    config: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    # Results — only ever populated by deterministic code, NEVER by LLM
    metrics: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Optional FK to existing backtest infrastructure
    backtest_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )


class ResearchNoteModel(Base):
    """Timestamped, typed research note attached to an experiment."""

    __tablename__ = "research_notes"
    __table_args__ = (
        Index("ix_research_notes_experiment_id", "experiment_id"),
        Index("ix_research_notes_note_type", "note_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    experiment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("research_experiments.id", ondelete="CASCADE"),
        nullable=False,
    )
    note_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    stage: Mapped[str | None] = mapped_column(String(50), nullable=True)
    author: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )


class ExperimentLinkModel(Base):
    """Lineage / relationship between experiments."""

    __tablename__ = "experiment_links"
    __table_args__ = (
        Index("ix_experiment_links_parent", "parent_experiment_id"),
        Index("ix_experiment_links_child", "child_experiment_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    parent_experiment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("research_experiments.id", ondelete="CASCADE"),
        nullable=False,
    )
    child_experiment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("research_experiments.id", ondelete="CASCADE"),
        nullable=False,
    )
    link_type: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
