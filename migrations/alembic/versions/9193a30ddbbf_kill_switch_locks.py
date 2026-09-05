"""kill_switch_locks

Revision ID: 9193a30ddbbf
Revises: 0005
Create Date: 2026-08-31 19:49:33.157501+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9193a30ddbbf'
down_revision: Union[str, None] = '0005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'kill_switch_locks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('triggered_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('executed_by', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('kill_switch_locks')
