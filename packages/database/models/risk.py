from __future__ import annotations

from packages.database.models.relational import (
    RiskConfigVersionModel,
    RiskDecisionModel,
    RiskRuleModel,
)

RiskConfigVersion = RiskConfigVersionModel
RiskDecision = RiskDecisionModel
RiskRule = RiskRuleModel

__all__ = [
    "RiskConfigVersion",
    "RiskConfigVersionModel",
    "RiskDecision",
    "RiskDecisionModel",
    "RiskRule",
    "RiskRuleModel",
]
