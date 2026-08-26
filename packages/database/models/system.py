from __future__ import annotations

from packages.database.models.relational import (
    ReconciliationDivergenceModel,
    ReconciliationRunModel,
    SystemConfigModel,
)

# Aliases for plan compatibility
SystemConfig = SystemConfigModel
ReconciliationRun = ReconciliationRunModel
ReconciliationDivergence = ReconciliationDivergenceModel

__all__ = [
    "ReconciliationDivergence",
    "ReconciliationDivergenceModel",
    "ReconciliationRun",
    "ReconciliationRunModel",
    "SystemConfig",
    "SystemConfigModel",
]
