from __future__ import annotations

from enum import Enum
from typing import ClassVar

from packages.exchange.errors import UnknownStateError


class ExecutionState(str, Enum):
    PENDING = "PENDING"
    SUBMITTING = "SUBMITTING"
    SUBMITTED = "SUBMITTED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    UNKNOWN = "UNKNOWN"

    @classmethod
    def from_str(cls, value: str | ExecutionState) -> ExecutionState:
        if isinstance(value, ExecutionState):
            return value
        return cls(value.upper())


class ExecutionStateMachine:
    """State machine governing execution request and order lifecycles.
    
    Fail-closed principle: UNKNOWN state blocks subsequent trading actions
    until resolved by query/reconciliation.
    """

    VALID_TRANSITIONS: ClassVar[dict[ExecutionState, set[ExecutionState]]] = {
        ExecutionState.PENDING: {
            ExecutionState.SUBMITTING,
            ExecutionState.REJECTED,
            ExecutionState.CANCELLED,
            ExecutionState.EXPIRED,
        },
        ExecutionState.SUBMITTING: {
            ExecutionState.SUBMITTED,
            ExecutionState.REJECTED,
            ExecutionState.UNKNOWN,
        },
        ExecutionState.SUBMITTED: {
            ExecutionState.PARTIALLY_FILLED,
            ExecutionState.FILLED,
            ExecutionState.CANCELLED,
            ExecutionState.EXPIRED,
            ExecutionState.UNKNOWN,
        },
        ExecutionState.PARTIALLY_FILLED: {
            ExecutionState.FILLED,
            ExecutionState.CANCELLED,
            ExecutionState.EXPIRED,
            ExecutionState.UNKNOWN,
        },
        ExecutionState.UNKNOWN: {
            ExecutionState.SUBMITTED,
            ExecutionState.PARTIALLY_FILLED,
            ExecutionState.FILLED,
            ExecutionState.CANCELLED,
            ExecutionState.REJECTED,
            ExecutionState.EXPIRED,
        },
        ExecutionState.FILLED: set(),
        ExecutionState.CANCELLED: set(),
        ExecutionState.REJECTED: set(),
        ExecutionState.EXPIRED: set(),
    }

    TERMINAL_STATES: ClassVar[set[ExecutionState]] = {
        ExecutionState.FILLED,
        ExecutionState.CANCELLED,
        ExecutionState.REJECTED,
        ExecutionState.EXPIRED,
    }

    def can_transition(
        self, current: ExecutionState | str, next_state: ExecutionState | str
    ) -> bool:
        curr_enum = ExecutionState.from_str(current)
        next_enum = ExecutionState.from_str(next_state)
        return next_enum in self.VALID_TRANSITIONS.get(curr_enum, set())

    def transition(
        self, current: ExecutionState | str, next_state: ExecutionState | str
    ) -> ExecutionState:
        curr_enum = ExecutionState.from_str(current)
        next_enum = ExecutionState.from_str(next_state)

        if not self.can_transition(curr_enum, next_enum):
            raise ValueError(f"Invalid transition from {curr_enum.value} to {next_enum.value}")

        return next_enum

    def is_terminal(self, state: ExecutionState | str) -> bool:
        state_enum = ExecutionState.from_str(state)
        return state_enum in self.TERMINAL_STATES

    def is_unknown(self, state: ExecutionState | str) -> bool:
        state_enum = ExecutionState.from_str(state)
        return state_enum == ExecutionState.UNKNOWN
