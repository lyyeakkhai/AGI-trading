from __future__ import annotations

import pytest

from packages.domain.execution import ExecutionState, ExecutionStateMachine


def test_valid_execution_transitions() -> None:
    sm = ExecutionStateMachine()

    # Happy path: PENDING -> SUBMITTING -> SUBMITTED -> FILLED
    assert sm.transition(ExecutionState.PENDING, ExecutionState.SUBMITTING) == ExecutionState.SUBMITTING
    assert sm.transition(ExecutionState.SUBMITTING, ExecutionState.SUBMITTED) == ExecutionState.SUBMITTED
    assert sm.transition(ExecutionState.SUBMITTED, ExecutionState.PARTIALLY_FILLED) == ExecutionState.PARTIALLY_FILLED
    assert sm.transition(ExecutionState.PARTIALLY_FILLED, ExecutionState.FILLED) == ExecutionState.FILLED


def test_submitting_to_unknown_and_resolution() -> None:
    sm = ExecutionStateMachine()

    # Network timeout during submit: SUBMITTING -> UNKNOWN
    assert sm.transition(ExecutionState.SUBMITTING, ExecutionState.UNKNOWN) == ExecutionState.UNKNOWN
    assert sm.is_unknown(ExecutionState.UNKNOWN) is True

    # Reconciliation resolves UNKNOWN -> FILLED
    assert sm.transition(ExecutionState.UNKNOWN, ExecutionState.FILLED) == ExecutionState.FILLED


def test_invalid_transitions_raise_value_error() -> None:
    sm = ExecutionStateMachine()

    # Cannot jump directly from PENDING to FILLED
    with pytest.raises(ValueError, match="Invalid transition from PENDING to FILLED"):
        sm.transition(ExecutionState.PENDING, ExecutionState.FILLED)

    # Terminal state FILLED cannot transition to SUBMITTED
    with pytest.raises(ValueError, match="Invalid transition from FILLED to SUBMITTED"):
        sm.transition(ExecutionState.FILLED, ExecutionState.SUBMITTED)


def test_terminal_states() -> None:
    sm = ExecutionStateMachine()
    assert sm.is_terminal(ExecutionState.FILLED) is True
    assert sm.is_terminal(ExecutionState.CANCELLED) is True
    assert sm.is_terminal(ExecutionState.REJECTED) is True
    assert sm.is_terminal(ExecutionState.EXPIRED) is True
    assert sm.is_terminal(ExecutionState.SUBMITTED) is False
    assert sm.is_terminal(ExecutionState.UNKNOWN) is False


def test_string_inputs() -> None:
    sm = ExecutionStateMachine()
    assert sm.transition("pending", "submitting") == ExecutionState.SUBMITTING
    assert sm.can_transition("submitting", "submitted") is True
    assert sm.can_transition("filled", "submitting") is False
