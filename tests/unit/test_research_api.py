"""Integration tests for the Research Experiment API.

Uses httpx.AsyncClient with ASGI transport (same pattern as other unit tests).
These tests exercise the router → service → ORM layer end-to-end with
the in-memory test DB from conftest.py.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from apps.api.main import app
from apps.api.dependencies import verify_owner_session
from packages.domain.enums import (
    ExperimentCategory,
    ExperimentStatus,
    ResearchNoteType,
    ValidationRunType,
    ConclusionOutcome,
)

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[verify_owner_session] = lambda: {"user_id": "test_user"}
    yield
    app.dependency_overrides.clear()


# ── Helpers ───────────────────────────────────────────────────────────────


def make_experiment_payload(**kwargs) -> dict:
    defaults = {
        "title": "BTC 4H Breakout With Volume Confirmation",
        "description": "Test breakout with volume filter.",
        "category": ExperimentCategory.BREAKOUT.value,
        "hypothesis": {
            "statement": "Breakouts with volume > 2x MA have higher win rates.",
            "rationale": "Volume confirms demand at price levels.",
            "expected_behavior": "Higher win rate and profit factor vs unfiltered breakouts.",
            "assumptions": ["Liquid spot markets only"],
            "invalidation_criteria": ["Net return < 0 after all costs"],
        },
        "tags": ["btc", "breakout", "volume"],
    }
    defaults.update(kwargs)
    return defaults


# ── CRUD ──────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_experiment(client: AsyncClient):
    """POST /api/v1/research/experiments returns 201 with correct fields."""
    payload = make_experiment_payload()
    resp = await client.post("/api/v1/research/experiments", json=payload)
    assert resp.status_code == 201, resp.text

    data = resp.json()
    assert data["title"] == payload["title"]
    assert data["status"] == ExperimentStatus.DRAFT.value
    assert data["category"] == ExperimentCategory.BREAKOUT.value
    assert data["experiment_id"].startswith("EXP-")
    assert data["validation_runs"] == []
    assert data["notes"] == []


@pytest.mark.asyncio
async def test_create_experiment_title_too_short(client: AsyncClient):
    """POST with title < 3 chars returns 422."""
    payload = make_experiment_payload(title="AB")
    resp = await client.post("/api/v1/research/experiments", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_experiments(client: AsyncClient):
    """GET /api/v1/research/experiments returns list."""
    # Create one
    await client.post("/api/v1/research/experiments", json=make_experiment_payload())

    resp = await client.get("/api/v1/research/experiments")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_list_filter_by_status(client: AsyncClient):
    """GET with ?status=DRAFT returns only DRAFT experiments."""
    await client.post("/api/v1/research/experiments", json=make_experiment_payload())

    resp = await client.get("/api/v1/research/experiments?status=DRAFT")
    assert resp.status_code == 200
    data = resp.json()
    for item in data:
        assert item["status"] == "DRAFT"


@pytest.mark.asyncio
async def test_list_filter_by_category(client: AsyncClient):
    """GET with ?category=breakout returns only breakout experiments."""
    await client.post("/api/v1/research/experiments", json=make_experiment_payload())
    await client.post(
        "/api/v1/research/experiments",
        json=make_experiment_payload(title="ETH Momentum", category="momentum"),
    )

    resp = await client.get("/api/v1/research/experiments?category=breakout")
    assert resp.status_code == 200
    data = resp.json()
    for item in data:
        assert item["category"] == "breakout"


@pytest.mark.asyncio
async def test_get_experiment_detail(client: AsyncClient):
    """GET /api/v1/research/experiments/{id} returns full detail."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    resp = await client.get(f"/api/v1/research/experiments/{exp_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == exp_id
    assert "hypothesis" in data
    assert "validation_runs" in data
    assert "notes" in data
    assert "parent_links" in data
    assert "child_links" in data


@pytest.mark.asyncio
async def test_get_experiment_not_found(client: AsyncClient):
    """GET with unknown ID returns 404."""
    import uuid
    fake_id = str(uuid.uuid4())
    resp = await client.get(f"/api/v1/research/experiments/{fake_id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_experiment_title(client: AsyncClient):
    """PATCH updates title correctly."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    resp = await client.patch(
        f"/api/v1/research/experiments/{exp_id}",
        json={"title": "Updated BTC Breakout Strategy"},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated BTC Breakout Strategy"


@pytest.mark.asyncio
async def test_status_transition_draft_to_ready(client: AsyncClient):
    """PATCH can advance status from DRAFT to READY."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    resp = await client.patch(
        f"/api/v1/research/experiments/{exp_id}",
        json={"status": "READY"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "READY"


@pytest.mark.asyncio
async def test_invalid_status_transition_returns_400(client: AsyncClient):
    """PATCH with invalid transition returns 400, not 500."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    # DRAFT → VALIDATED is blocked
    resp = await client.patch(
        f"/api/v1/research/experiments/{exp_id}",
        json={"status": "VALIDATED"},
    )
    assert resp.status_code == 400


# ── Notes ─────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_add_note(client: AsyncClient):
    """POST /notes returns 201 with correct note data."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    note_payload = {
        "note_type": ResearchNoteType.OBSERVATION.value,
        "content": "Initial observation: volume spikes on breakouts.",
        "stage": "SETUP",
    }
    resp = await client.post(
        f"/api/v1/research/experiments/{exp_id}/notes", json=note_payload
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["note_type"] == ResearchNoteType.OBSERVATION.value
    assert data["content"] == note_payload["content"]
    assert data["stage"] == "SETUP"


@pytest.mark.asyncio
async def test_notes_appear_in_detail(client: AsyncClient):
    """Notes added via POST appear in GET experiment detail."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    await client.post(
        f"/api/v1/research/experiments/{exp_id}/notes",
        json={"note_type": "FINDING", "content": "Volume filter improves entry quality."},
    )

    resp = await client.get(f"/api/v1/research/experiments/{exp_id}")
    assert resp.status_code == 200
    notes = resp.json()["notes"]
    assert len(notes) == 1
    assert notes[0]["content"] == "Volume filter improves entry quality."


# ── Validation runs ───────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_start_validation_run(client: AsyncClient):
    """POST /validation-runs creates a run."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    resp = await client.post(
        f"/api/v1/research/experiments/{exp_id}/validation-runs",
        json={"run_type": ValidationRunType.BACKTEST.value, "description": "Initial backtest"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["run_type"] == "BACKTEST"
    assert data["metrics"] is None
    assert data["passed"] is None


@pytest.mark.asyncio
async def test_record_validation_result(client: AsyncClient):
    """PATCH /validation-runs/{run_id} records deterministic metrics."""
    from decimal import Decimal

    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    run_resp = await client.post(
        f"/api/v1/research/experiments/{exp_id}/validation-runs",
        json={"run_type": "BACKTEST"},
    )
    run_id = run_resp.json()["id"]

    metrics = {
        "net_return_pct": "0.25",
        "max_drawdown_pct": "0.08",
        "trade_count": 42,
        "win_rate": "0.57",
        "sharpe_ratio": "1.45",
    }
    resp = await client.patch(
        f"/api/v1/research/experiments/{exp_id}/validation-runs/{run_id}",
        json={"metrics": metrics, "passed": True},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["passed"] is True
    assert data["metrics"]["trade_count"] == 42


@pytest.mark.asyncio
async def test_positive_backtest_does_not_validate(client: AsyncClient):
    """A positive BACKTEST alone must NOT allow status → VALIDATED.

    This is the core invariant: positive backtest != validated.
    """
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    # Advance to COMPLETED state via transitions
    await client.patch(f"/api/v1/research/experiments/{exp_id}", json={"status": "READY"})
    await client.patch(f"/api/v1/research/experiments/{exp_id}", json={"status": "RUNNING"})
    await client.patch(f"/api/v1/research/experiments/{exp_id}", json={"status": "COMPLETED"})

    # Add a passed BACKTEST run
    run_resp = await client.post(
        f"/api/v1/research/experiments/{exp_id}/validation-runs",
        json={"run_type": "BACKTEST"},
    )
    run_id = run_resp.json()["id"]
    await client.patch(
        f"/api/v1/research/experiments/{exp_id}/validation-runs/{run_id}",
        json={"metrics": {"trade_count": 50}, "passed": True},
    )

    # Attempt VALIDATED — must be rejected (no OOS or WF)
    resp = await client.patch(
        f"/api/v1/research/experiments/{exp_id}",
        json={"status": "VALIDATED"},
    )
    assert resp.status_code == 400
    assert "OUT_OF_SAMPLE" in resp.text or "WALK_FORWARD" in resp.text or "insufficient" in resp.text.lower()


# ── Conclusion ────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_set_conclusion(client: AsyncClient):
    """POST /conclude records a structured conclusion."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    conclusion = {
        "conclusion": {
            "outcome": ConclusionOutcome.REJECTED.value,
            "evidence_summary": "Net return negative after costs.",
            "strengths": [],
            "weaknesses": ["Fee sensitivity"],
            "failure_reasons": ["Net return < 0 after realistic slippage"],
            "lessons_learned": "Volume filter alone insufficient without trend filter.",
        }
    }
    resp = await client.post(
        f"/api/v1/research/experiments/{exp_id}/conclude", json=conclusion
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["conclusion"]["outcome"] == "REJECTED"
    assert data["conclusion_outcome"] == "REJECTED"


# ── Archive ───────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_archive_experiment(client: AsyncClient):
    """POST /archive sets status to ARCHIVED."""
    create_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    exp_id = create_resp.json()["id"]

    resp = await client.post(f"/api/v1/research/experiments/{exp_id}/archive")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ARCHIVED"


# ── Follow-up / lineage ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_follow_up_experiment(client: AsyncClient):
    """POST /follow-up creates linked child experiment."""
    parent_resp = await client.post(
        "/api/v1/research/experiments", json=make_experiment_payload()
    )
    parent_id = parent_resp.json()["id"]

    follow_up_payload = {
        "title": "BTC 4H Breakout + RSI Filter",
        "hypothesis": {
            "statement": "Adding RSI filter to volume breakout improves win rate.",
            "rationale": "RSI filters out overbought entries.",
            "expected_behavior": "Better win rate with fewer but higher quality trades.",
        },
        "link_type": "FOLLOW_UP",
    }
    resp = await client.post(
        f"/api/v1/research/experiments/{parent_id}/follow-up", json=follow_up_payload
    )
    assert resp.status_code == 201
    child = resp.json()
    assert child["experiment_id"].startswith("EXP-")

    # Verify lineage visible from child
    child_detail = await client.get(f"/api/v1/research/experiments/{child['id']}")
    assert child_detail.status_code == 200
    parent_links = child_detail.json()["parent_links"]
    assert len(parent_links) == 1
    assert parent_links[0]["parent_experiment_id"] == parent_id
    assert parent_links[0]["link_type"] == "FOLLOW_UP"

    # Verify lineage visible from parent
    parent_detail = await client.get(f"/api/v1/research/experiments/{parent_id}")
    child_links = parent_detail.json()["child_links"]
    assert len(child_links) == 1
    assert child_links[0]["child_experiment_id"] == child["id"]
