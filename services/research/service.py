"""ResearchService — orchestrates the experiment lifecycle.

Business logic lives here, not in routers or ORM models.

Key invariants enforced:
- A positive backtest DOES NOT automatically validate an experiment.
- VALIDATED status requires at least one OOS or WF run that passed.
- REJECTED status preserves all evidence for historical audit.
- Experiment lineage is preserved; experiments are never hard-deleted.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.research import (
    ExperimentLinkModel,
    ResearchExperimentModel,
    ResearchNoteModel,
    ValidationRunModel,
)
from packages.domain.enums import (
    ConclusionOutcome,
    ExperimentLinkType,
    ExperimentStatus,
    ValidationRunType,
)
from packages.domain.experiment import (
    AddNoteRequest,
    AddValidationRunRequest,
    CreateExperimentRequest,
    CreateFollowUpRequest,
    DatasetDefinition,
    ExperimentConclusion,
    ExperimentConfig,
    ExperimentLinkResponse,
    ExperimentListItem,
    ExperimentResponse,
    HypothesisConfig,
    NoteResponse,
    SetConclusionRequest,
    UpdateExperimentRequest,
    UpdateValidationRunRequest,
    ValidationMetrics,
    ValidationRunResponse,
)
from packages.logging import get_logger

logger = get_logger("research_service")

# Valid status transitions
_ALLOWED_TRANSITIONS: dict[ExperimentStatus, set[ExperimentStatus]] = {
    ExperimentStatus.DRAFT: {ExperimentStatus.READY, ExperimentStatus.ARCHIVED},
    ExperimentStatus.READY: {
        ExperimentStatus.RUNNING,
        ExperimentStatus.DRAFT,
        ExperimentStatus.ARCHIVED,
    },
    ExperimentStatus.RUNNING: {
        ExperimentStatus.COMPLETED,
        ExperimentStatus.REJECTED,
        ExperimentStatus.ARCHIVED,
    },
    ExperimentStatus.COMPLETED: {
        ExperimentStatus.VALIDATED,
        ExperimentStatus.REJECTED,
        ExperimentStatus.ARCHIVED,
        ExperimentStatus.RUNNING,  # re-run allowed
    },
    ExperimentStatus.VALIDATED: {ExperimentStatus.ARCHIVED},
    ExperimentStatus.REJECTED: {ExperimentStatus.ARCHIVED},
    ExperimentStatus.ARCHIVED: set(),
}


def _now() -> datetime:
    return datetime.now(UTC)


def _slug(n: int) -> str:
    return f"EXP-{n:04d}"


def _model_to_response(
    model: ResearchExperimentModel,
    validation_runs: list[ValidationRunModel] | None = None,
    notes: list[ResearchNoteModel] | None = None,
    parent_links: list[ExperimentLinkModel] | None = None,
    child_links: list[ExperimentLinkModel] | None = None,
) -> ExperimentResponse:
    def parse_hypothesis(d: dict[str, Any]) -> HypothesisConfig:
        return HypothesisConfig(**d)

    def parse_config(d: dict[str, Any] | None) -> ExperimentConfig | None:
        return ExperimentConfig(**d) if d else None

    def parse_dataset(d: dict[str, Any] | None) -> DatasetDefinition | None:
        return DatasetDefinition(**d) if d else None

    def parse_conclusion(d: dict[str, Any] | None) -> ExperimentConclusion | None:
        return ExperimentConclusion(**d) if d else None

    def parse_vr(vr: ValidationRunModel) -> ValidationRunResponse:
        return ValidationRunResponse(
            id=vr.id,
            experiment_id=vr.experiment_id,
            run_type=ValidationRunType(vr.run_type),
            description=vr.description,
            config=vr.config or {},
            metrics=ValidationMetrics(**vr.metrics) if vr.metrics else None,
            passed=vr.passed,
            backtest_job_id=vr.backtest_job_id,
            notes=vr.notes,
            started_at=vr.started_at,
            completed_at=vr.completed_at,
            created_at=vr.created_at,
        )

    def parse_note(n: ResearchNoteModel) -> NoteResponse:
        from packages.domain.enums import ResearchNoteType

        return NoteResponse(
            id=n.id,
            experiment_id=n.experiment_id,
            note_type=ResearchNoteType(n.note_type),
            content=n.content,
            stage=n.stage,
            author=n.author,
            created_at=n.created_at,
        )

    def parse_link(lnk: ExperimentLinkModel) -> ExperimentLinkResponse:
        return ExperimentLinkResponse(
            id=lnk.id,
            parent_experiment_id=lnk.parent_experiment_id,
            child_experiment_id=lnk.child_experiment_id,
            link_type=ExperimentLinkType(lnk.link_type),
            created_at=lnk.created_at,
        )

    return ExperimentResponse(
        id=model.id,
        experiment_id=model.experiment_id,
        title=model.title,
        description=model.description,
        status=ExperimentStatus(model.status),
        category=model.category,  # type: ignore[arg-type]
        hypothesis=parse_hypothesis(model.hypothesis),
        config=parse_config(model.config),
        dataset=parse_dataset(model.dataset),
        conclusion=parse_conclusion(model.conclusion),
        tags=model.tags or [],
        validation_runs=[parse_vr(vr) for vr in (validation_runs or [])],
        notes=[parse_note(n) for n in (notes or [])],
        parent_links=[parse_link(lnk) for lnk in (parent_links or [])],
        child_links=[parse_link(lnk) for lnk in (child_links or [])],
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class ResearchService:
    """Orchestrates the research experiment lifecycle."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ── Creation ────────────────────────────────────────────────────────────

    async def create_experiment(self, req: CreateExperimentRequest) -> ExperimentResponse:
        # Compute next sequence number
        result = await self.session.execute(
            select(func.coalesce(func.max(ResearchExperimentModel.sequence_number), 0))
        )
        max_seq: int = result.scalar_one()
        next_seq = max_seq + 1

        now = _now()
        model = ResearchExperimentModel(
            id=uuid.uuid4(),
            experiment_id=_slug(next_seq),
            sequence_number=next_seq,
            title=req.title,
            description=req.description,
            status=ExperimentStatus.DRAFT.value,
            category=req.category.value,
            asset=req.config.asset if req.config else None,
            timeframe=req.config.timeframe if req.config else None,
            hypothesis=req.hypothesis.model_dump(),
            config=req.config.model_dump() if req.config else None,
            dataset=req.dataset.model_dump() if req.dataset else None,
            conclusion=None,
            conclusion_outcome=None,
            tags=req.tags,
            created_at=now,
            updated_at=now,
        )
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        logger.info(
            "research_experiment_created",
            experiment_id=model.experiment_id,
            title=model.title,
        )
        return _model_to_response(model)

    # ── Retrieval ────────────────────────────────────────────────────────────

    async def get_experiment(self, experiment_id: uuid.UUID) -> ExperimentResponse | None:
        stmt = select(ResearchExperimentModel).where(
            ResearchExperimentModel.id == experiment_id
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            return None

        vrs = await self._load_validation_runs(model.id)
        notes = await self._load_notes(model.id)
        parent_links = await self._load_parent_links(model.id)
        child_links = await self._load_child_links(model.id)

        return _model_to_response(model, vrs, notes, parent_links, child_links)

    async def list_experiments(
        self,
        status: str | None = None,
        category: str | None = None,
        asset: str | None = None,
        timeframe: str | None = None,
        conclusion_outcome: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ExperimentListItem]:
        stmt = select(ResearchExperimentModel)

        if status:
            stmt = stmt.where(ResearchExperimentModel.status == status)
        if category:
            stmt = stmt.where(ResearchExperimentModel.category == category)
        if asset:
            stmt = stmt.where(ResearchExperimentModel.asset == asset)
        if timeframe:
            stmt = stmt.where(ResearchExperimentModel.timeframe == timeframe)
        if conclusion_outcome:
            stmt = stmt.where(
                ResearchExperimentModel.conclusion_outcome == conclusion_outcome
            )

        stmt = (
            stmt.order_by(ResearchExperimentModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        items: list[ExperimentListItem] = []
        for m in models:
            # Count validation runs
            count_result = await self.session.execute(
                select(func.count(ValidationRunModel.id)).where(
                    ValidationRunModel.experiment_id == m.id
                )
            )
            vr_count: int = count_result.scalar_one()

            from packages.domain.enums import ExperimentCategory

            items.append(
                ExperimentListItem(
                    id=m.id,
                    experiment_id=m.experiment_id,
                    title=m.title,
                    status=ExperimentStatus(m.status),
                    category=ExperimentCategory(m.category),
                    asset=m.asset,
                    timeframe=m.timeframe,
                    conclusion_outcome=(
                        ConclusionOutcome(m.conclusion_outcome)
                        if m.conclusion_outcome
                        else None
                    ),
                    validation_run_count=vr_count,
                    created_at=m.created_at,
                    updated_at=m.updated_at,
                )
            )
        return items

    # ── Update ───────────────────────────────────────────────────────────────

    async def update_experiment(
        self, experiment_id: uuid.UUID, req: UpdateExperimentRequest
    ) -> ExperimentResponse | None:
        model = await self._get_model(experiment_id)
        if model is None:
            return None

        if req.title is not None:
            model.title = req.title
        if req.description is not None:
            model.description = req.description
        if req.category is not None:
            model.category = req.category.value
        if req.hypothesis is not None:
            model.hypothesis = req.hypothesis.model_dump()
        if req.config is not None:
            model.config = req.config.model_dump()
            model.asset = req.config.asset
            model.timeframe = req.config.timeframe
        if req.dataset is not None:
            model.dataset = req.dataset.model_dump()
        if req.tags is not None:
            model.tags = req.tags

        if req.status is not None:
            await self._validate_transition(model, req.status)
            model.status = req.status.value

        model.updated_at = _now()
        await self.session.commit()
        await self.session.refresh(model)

        vrs = await self._load_validation_runs(model.id)
        notes = await self._load_notes(model.id)
        parent_links = await self._load_parent_links(model.id)
        child_links = await self._load_child_links(model.id)
        return _model_to_response(model, vrs, notes, parent_links, child_links)

    # ── Notes ────────────────────────────────────────────────────────────────

    async def add_note(
        self, experiment_id: uuid.UUID, req: AddNoteRequest
    ) -> NoteResponse | None:
        model = await self._get_model(experiment_id)
        if model is None:
            return None

        note = ResearchNoteModel(
            id=uuid.uuid4(),
            experiment_id=experiment_id,
            note_type=req.note_type.value,
            content=req.content,
            stage=req.stage,
            author=req.author,
            created_at=_now(),
        )
        self.session.add(note)
        await self.session.commit()
        await self.session.refresh(note)

        from packages.domain.enums import ResearchNoteType

        return NoteResponse(
            id=note.id,
            experiment_id=note.experiment_id,
            note_type=ResearchNoteType(note.note_type),
            content=note.content,
            stage=note.stage,
            author=note.author,
            created_at=note.created_at,
        )

    # ── Validation runs ──────────────────────────────────────────────────────

    async def start_validation_run(
        self, experiment_id: uuid.UUID, req: AddValidationRunRequest
    ) -> ValidationRunResponse | None:
        model = await self._get_model(experiment_id)
        if model is None:
            return None

        now = _now()
        run = ValidationRunModel(
            id=uuid.uuid4(),
            experiment_id=experiment_id,
            run_type=req.run_type.value,
            description=req.description,
            config=req.config,
            metrics=None,
            passed=None,
            backtest_job_id=req.backtest_job_id,
            notes=None,
            started_at=now,
            completed_at=None,
            created_at=now,
        )
        self.session.add(run)
        await self.session.commit()
        await self.session.refresh(run)

        return ValidationRunResponse(
            id=run.id,
            experiment_id=run.experiment_id,
            run_type=ValidationRunType(run.run_type),
            description=run.description,
            config=run.config or {},
            metrics=None,
            passed=None,
            backtest_job_id=run.backtest_job_id,
            notes=None,
            started_at=run.started_at,
            completed_at=run.completed_at,
            created_at=run.created_at,
        )

    async def record_validation_result(
        self,
        experiment_id: uuid.UUID,
        run_id: uuid.UUID,
        req: UpdateValidationRunRequest,
    ) -> ValidationRunResponse | None:
        stmt = select(ValidationRunModel).where(
            ValidationRunModel.id == run_id,
            ValidationRunModel.experiment_id == experiment_id,
        )
        result = await self.session.execute(stmt)
        run = result.scalar_one_or_none()
        if run is None:
            return None

        run.metrics = req.metrics.model_dump()
        run.passed = req.passed
        run.notes = req.notes
        run.completed_at = _now()
        await self.session.commit()
        await self.session.refresh(run)

        return ValidationRunResponse(
            id=run.id,
            experiment_id=run.experiment_id,
            run_type=ValidationRunType(run.run_type),
            description=run.description,
            config=run.config or {},
            metrics=ValidationMetrics(**run.metrics) if run.metrics else None,
            passed=run.passed,
            backtest_job_id=run.backtest_job_id,
            notes=run.notes,
            started_at=run.started_at,
            completed_at=run.completed_at,
            created_at=run.created_at,
        )

    # ── Conclusion ───────────────────────────────────────────────────────────

    async def set_conclusion(
        self, experiment_id: uuid.UUID, req: SetConclusionRequest
    ) -> ExperimentResponse | None:
        model = await self._get_model(experiment_id)
        if model is None:
            return None

        model.conclusion = req.conclusion.model_dump()
        model.conclusion_outcome = req.conclusion.outcome.value
        model.updated_at = _now()

        # Auto-advance to COMPLETED if still RUNNING or READY
        if model.status in (ExperimentStatus.RUNNING.value, ExperimentStatus.READY.value):
            model.status = ExperimentStatus.COMPLETED.value

        await self.session.commit()
        await self.session.refresh(model)

        vrs = await self._load_validation_runs(model.id)
        notes = await self._load_notes(model.id)
        parent_links = await self._load_parent_links(model.id)
        child_links = await self._load_child_links(model.id)
        return _model_to_response(model, vrs, notes, parent_links, child_links)

    # ── Lifecycle ────────────────────────────────────────────────────────────

    async def archive_experiment(self, experiment_id: uuid.UUID) -> ExperimentResponse | None:
        """Archive preserves all evidence — no data is deleted."""
        model = await self._get_model(experiment_id)
        if model is None:
            return None

        model.status = ExperimentStatus.ARCHIVED.value
        model.updated_at = _now()
        await self.session.commit()
        await self.session.refresh(model)

        vrs = await self._load_validation_runs(model.id)
        notes = await self._load_notes(model.id)
        parent_links = await self._load_parent_links(model.id)
        child_links = await self._load_child_links(model.id)
        return _model_to_response(model, vrs, notes, parent_links, child_links)

    # ── Lineage ──────────────────────────────────────────────────────────────

    async def create_follow_up_experiment(
        self, parent_id: uuid.UUID, req: CreateFollowUpRequest
    ) -> ExperimentResponse | None:
        parent = await self._get_model(parent_id)
        if parent is None:
            return None

        # Inherit category from parent if not overridden
        from packages.domain.enums import ExperimentCategory

        effective_category = req.category or ExperimentCategory(parent.category)

        create_req = CreateExperimentRequest(
            title=req.title,
            description=req.description,
            category=effective_category,
            hypothesis=req.hypothesis,
        )
        child_response = await self.create_experiment(create_req)

        # Create lineage link
        link = ExperimentLinkModel(
            id=uuid.uuid4(),
            parent_experiment_id=parent_id,
            child_experiment_id=child_response.id,
            link_type=req.link_type.value,
            created_at=_now(),
        )
        self.session.add(link)
        await self.session.commit()

        return await self.get_experiment(child_response.id)

    # ── Private helpers ──────────────────────────────────────────────────────

    async def _get_model(
        self, experiment_id: uuid.UUID
    ) -> ResearchExperimentModel | None:
        result = await self.session.execute(
            select(ResearchExperimentModel).where(
                ResearchExperimentModel.id == experiment_id
            )
        )
        return result.scalar_one_or_none()

    async def _load_validation_runs(
        self, experiment_id: uuid.UUID
    ) -> list[ValidationRunModel]:
        result = await self.session.execute(
            select(ValidationRunModel)
            .where(ValidationRunModel.experiment_id == experiment_id)
            .order_by(ValidationRunModel.created_at.asc())
        )
        return list(result.scalars().all())

    async def _load_notes(self, experiment_id: uuid.UUID) -> list[ResearchNoteModel]:
        result = await self.session.execute(
            select(ResearchNoteModel)
            .where(ResearchNoteModel.experiment_id == experiment_id)
            .order_by(ResearchNoteModel.created_at.asc())
        )
        return list(result.scalars().all())

    async def _load_parent_links(
        self, experiment_id: uuid.UUID
    ) -> list[ExperimentLinkModel]:
        result = await self.session.execute(
            select(ExperimentLinkModel).where(
                ExperimentLinkModel.child_experiment_id == experiment_id
            )
        )
        return list(result.scalars().all())

    async def _load_child_links(
        self, experiment_id: uuid.UUID
    ) -> list[ExperimentLinkModel]:
        result = await self.session.execute(
            select(ExperimentLinkModel).where(
                ExperimentLinkModel.parent_experiment_id == experiment_id
            )
        )
        return list(result.scalars().all())

    async def _validate_transition(
        self, model: ResearchExperimentModel, new_status: ExperimentStatus
    ) -> None:
        current = ExperimentStatus(model.status)
        allowed = _ALLOWED_TRANSITIONS.get(current, set())
        if new_status not in allowed:
            raise ValueError(
                f"Invalid status transition: {current.value} → {new_status.value}. "
                f"Allowed: {[s.value for s in allowed]}"
            )

        # Enforce: positive backtest alone cannot mark experiment as VALIDATED
        if new_status == ExperimentStatus.VALIDATED:
            # Must have at least one OOS or WF run that passed
            result = await self.session.execute(
                select(ValidationRunModel).where(
                    ValidationRunModel.experiment_id == model.id,
                    ValidationRunModel.run_type.in_(
                        [
                            ValidationRunType.OUT_OF_SAMPLE.value,
                            ValidationRunType.WALK_FORWARD.value,
                        ]
                    ),
                    ValidationRunModel.passed.is_(True),
                )
            )
            oos_or_wf = result.scalars().first()
            if oos_or_wf is None:
                raise ValueError(
                    "Cannot mark experiment as VALIDATED: "
                    "requires at least one passed OUT_OF_SAMPLE or WALK_FORWARD validation run. "
                    "A positive backtest alone is insufficient evidence."
                )
