"""add futures leverage and reduce_only

Revision ID: 79799b33191d
Revises: 9193a30ddbbf
Create Date: 2026-09-08 20:00:22.538718+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79799b33191d'
down_revision: Union[str, None] = '9193a30ddbbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # trading_plans table
    op.add_column('trading_plans', sa.Column('leverage', sa.Integer(), nullable=True))
    op.add_column('trading_plans', sa.Column('reduce_only', sa.Boolean(), server_default='false', nullable=False))
    
    # trade_proposals table
    op.add_column('trade_proposals', sa.Column('leverage', sa.Integer(), nullable=True))
    op.add_column('trade_proposals', sa.Column('reduce_only', sa.Boolean(), server_default='false', nullable=False))

    # execution_requests table
    op.add_column('execution_requests', sa.Column('leverage', sa.Integer(), nullable=True))
    op.add_column('execution_requests', sa.Column('reduce_only', sa.Boolean(), server_default='false', nullable=False))

    # orders table
    op.add_column('orders', sa.Column('leverage', sa.Integer(), nullable=True))
    op.add_column('orders', sa.Column('reduce_only', sa.Boolean(), server_default='false', nullable=False))

    # fills table
    op.add_column('fills', sa.Column('leverage', sa.Integer(), nullable=True))
    op.add_column('fills', sa.Column('reduce_only', sa.Boolean(), server_default='false', nullable=False))

    # positions table
    op.add_column('positions', sa.Column('leverage', sa.Integer(), nullable=True))
    op.add_column('positions', sa.Column('reduce_only', sa.Boolean(), server_default='false', nullable=False))

    # trades table
    op.add_column('trades', sa.Column('leverage', sa.Integer(), nullable=True))
    op.add_column('trades', sa.Column('reduce_only', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    # trades table
    op.drop_column('trades', 'reduce_only')
    op.drop_column('trades', 'leverage')

    # positions table
    op.drop_column('positions', 'reduce_only')
    op.drop_column('positions', 'leverage')

    # fills table
    op.drop_column('fills', 'reduce_only')
    op.drop_column('fills', 'leverage')

    # orders table
    op.drop_column('orders', 'reduce_only')
    op.drop_column('orders', 'leverage')

    # execution_requests table
    op.drop_column('execution_requests', 'reduce_only')
    op.drop_column('execution_requests', 'leverage')

    # trade_proposals table
    op.drop_column('trade_proposals', 'reduce_only')
    op.drop_column('trade_proposals', 'leverage')

    # trading_plans table
    op.drop_column('trading_plans', 'reduce_only')
    op.drop_column('trading_plans', 'leverage')
