from __future__ import annotations

from packages.database.models.relational import AuditLogModel

# Alias for backwards/plan compatibility
AuditRecord = AuditLogModel

__all__ = ["AuditLogModel", "AuditRecord"]
