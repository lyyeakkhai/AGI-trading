from __future__ import annotations

from packages.database.models.relational import IdempotencyKeyModel

# Alias for backwards/plan compatibility
IdempotencyRecord = IdempotencyKeyModel

__all__ = ["IdempotencyKeyModel", "IdempotencyRecord"]
