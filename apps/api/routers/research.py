"""Research Experiment System — REST API router.

Follows the same conventions as analytics.py and backtesting.py:
  - prefix /api/v1/research
  - get_db_session dependency
  - verify_owner_session on mutations
  - Pydantic response models
"""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_owner_session
from packages.database.engine import get_db_session
from packages.domain.experiment import (
    AddNoteRequest,
    AddValidationRunRequest,
    CreateExperimentRequest,
    CreateFollowUpRequest,
    ExperimentListItem,
    ExperimentResponse,
    NoteResponse,
    SetConclusionRequest,
    UpdateExperimentRequest,
    UpdateValidationRunRequest,
    ValidationRunResponse,
)
from services.research.service import ResearchService

router = APIRouter(prefix="/api/v1/research", tags=["research"])


def get_research_service(
    session: AsyncSession = Depends(get_db_session),
) -> ResearchService:
    return ResearchService(session)


# ── Experiments ──────────────────────────────────────────────────────────────


@router.post(
    "/experiments",
    response_model=ExperimentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_experiment(
    req: CreateExperimentRequest,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ExperimentResponse:
    """Create a new research experiment (starts in DRAFT status)."""
    return await svc.create_experiment(req)


@router.get("/experiments", response_model=list[ExperimentListItem])
async def list_experiments(
    status_filter: str | None = Query(None, alias="status"),
    category: str | None = Query(None),
    asset: str | None = Query(None),
    timeframe: str | None = Query(None),
    conclusion_outcome: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> list[ExperimentListItem]:
    """List experiments with optional filters."""
    return await svc.list_experiments(
        status=status_filter,
        category=category,
        asset=asset,
        timeframe=timeframe,
        conclusion_outcome=conclusion_outcome,
        limit=limit,
        offset=offset,
    )


@router.get("/experiments/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(
    experiment_id: uuid.UUID,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ExperimentResponse:
    """Get full experiment detail including config, validation runs, notes and lineage."""
    result = await svc.get_experiment(experiment_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result


@router.patch("/experiments/{experiment_id}", response_model=ExperimentResponse)
async def update_experiment(
    experiment_id: uuid.UUID,
    req: UpdateExperimentRequest,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ExperimentResponse:
    """Update experiment metadata, status, or configuration."""
    try:
        result = await svc.update_experiment(experiment_id, req)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result


# ── Notes ────────────────────────────────────────────────────────────────────


@router.post(
    "/experiments/{experiment_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_note(
    experiment_id: uuid.UUID,
    req: AddNoteRequest,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> NoteResponse:
    """Add a structured research note to an experiment."""
    result = await svc.add_note(experiment_id, req)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result


# ── Validation runs ──────────────────────────────────────────────────────────


@router.post(
    "/experiments/{experiment_id}/validation-runs",
    response_model=ValidationRunResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_validation_run(
    experiment_id: uuid.UUID,
    req: AddValidationRunRequest,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ValidationRunResponse:
    """Start a validation run for an experiment."""
    result = await svc.start_validation_run(experiment_id, req)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result


@router.patch(
    "/experiments/{experiment_id}/validation-runs/{run_id}",
    response_model=ValidationRunResponse,
)
async def record_validation_result(
    experiment_id: uuid.UUID,
    run_id: uuid.UUID,
    req: UpdateValidationRunRequest,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ValidationRunResponse:
    """Record deterministic results from a completed validation run.

    These metrics must originate from deterministic code — never from LLM inference.
    """
    result = await svc.record_validation_result(experiment_id, run_id, req)
    if result is None:
        raise HTTPException(status_code=404, detail="Validation run not found")
    return result


# ── Conclusion ───────────────────────────────────────────────────────────────


@router.post("/experiments/{experiment_id}/conclude", response_model=ExperimentResponse)
async def set_conclusion(
    experiment_id: uuid.UUID,
    req: SetConclusionRequest,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ExperimentResponse:
    """Set the research conclusion for a completed experiment."""
    result = await svc.set_conclusion(experiment_id, req)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result


# ── Lifecycle ────────────────────────────────────────────────────────────────


@router.post("/experiments/{experiment_id}/archive", response_model=ExperimentResponse)
async def archive_experiment(
    experiment_id: uuid.UUID,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ExperimentResponse:
    """Archive an experiment. Evidence is preserved; no data is deleted."""
    result = await svc.archive_experiment(experiment_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return result


# ── Lineage ──────────────────────────────────────────────────────────────────


@router.post(
    "/experiments/{experiment_id}/follow-up",
    response_model=ExperimentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_follow_up(
    experiment_id: uuid.UUID,
    req: CreateFollowUpRequest,
    svc: ResearchService = Depends(get_research_service),
    _session_data: Annotated[dict, Depends(verify_owner_session)] = None,  # type: ignore[assignment]
) -> ExperimentResponse:
    """Create a follow-up experiment linked to a parent experiment."""
    result = await svc.create_follow_up_experiment(experiment_id, req)
    if result is None:
        raise HTTPException(status_code=404, detail="Parent experiment not found")
    return result
