from __future__ import annotations

from packages.database.models.relational import (
    FillModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
    TradeModel,
)

# Aliases for plan compatibility
FillDB = FillModel
PortfolioAccount = PortfolioAccountModel
PortfolioPosition = PositionModel
PortfolioEntry = PortfolioEntryModel
Trade = TradeModel

__all__ = [
    "FillDB",
    "FillModel",
    "PortfolioAccount",
    "PortfolioAccountModel",
    "PortfolioEntry",
    "PortfolioEntryModel",
    "PortfolioPosition",
    "PositionModel",
    "Trade",
    "TradeModel",
]
