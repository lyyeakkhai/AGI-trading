from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, field_validator


class _BaseFinancialValue(BaseModel):
    """Base class for all financial value objects rejecting float to avoid floating point inaccuracy."""

    model_config = ConfigDict(frozen=True)

    value: Decimal

    @field_validator("value", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError(f"float not allowed for {cls.__name__}; use Decimal")
        if isinstance(v, Decimal):
            return v
        if isinstance(v, (int, str)):
            return Decimal(str(v))
        raise ValueError(f"Cannot convert {type(v).__name__} to Decimal for {cls.__name__}")


class Price(_BaseFinancialValue):
    """Price value object."""

    pass


class Quantity(_BaseFinancialValue):
    """Quantity value object."""

    pass


class Notional(_BaseFinancialValue):
    """Notional value object."""

    pass


class Fee(_BaseFinancialValue):
    """Fee value object."""

    pass


class Balance(_BaseFinancialValue):
    """Balance value object."""

    pass


class PnL(_BaseFinancialValue):
    """Profit and Loss value object."""

    pass
