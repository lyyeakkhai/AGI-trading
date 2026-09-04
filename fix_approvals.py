with open("services/execution/approvals.py", "r") as f:
    lines = f.readlines()

new_lines = []
imports = []
content = []

for line in lines:
    if line.startswith("import ") or line.startswith("from "):
        imports.append(line)
    elif line.strip() == "":
        continue
    else:
        content.append(line)

# Let's just rewrite the top of the file cleanly:
clean = """from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.relational import OwnerApprovalModel
from packages.domain.enums import ApprovalStatus
from services.tradingagents.orchestrator import DebateOrchestrator

"""

with open("services/execution/approvals.py", "w") as f:
    f.write(clean)
    
    # skip the old import lines, find class OwnerApprovalService and write the rest
    start_writing = False
    for line in lines:
        if line.startswith("class ApprovalError"):
            start_writing = True
        if start_writing:
            f.write(line)
