from __future__ import annotations

from packages.database.models.relational import (
    ExecutionModel,
    ExecutionRequestModel,
    OrderModel,
)

# Alias for backwards/plan compatibility
ExecutionRequestDB = ExecutionRequestModel
OrderDB = OrderModel
ExecutionDB = ExecutionModel

__all__ = [
    "ExecutionDB",
    "ExecutionModel",
    "ExecutionRequestDB",
    "ExecutionRequestModel",
    "OrderDB",
    "OrderModel",
]
