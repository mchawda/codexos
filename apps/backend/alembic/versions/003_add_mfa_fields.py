"""Add MFA fields to users table

Revision ID: 003_add_mfa_fields
Revises: 002_agent_execution_history
Create Date: 2025-08-23 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add MFA fields to users table
    op.add_column('users', sa.Column('mfa_enabled', sa.Boolean(), nullable=True, default=False))
    op.add_column('users', sa.Column('mfa_method', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('mfa_secret', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('mfa_backup_codes', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('phone_number', sa.String(20), nullable=True))
    
    # Set default value for existing rows
    op.execute("UPDATE users SET mfa_enabled = false WHERE mfa_enabled IS NULL")
    
    # Make mfa_enabled not nullable
    op.alter_column('users', 'mfa_enabled', nullable=False)


def downgrade() -> None:
    # Remove MFA fields
    op.drop_column('users', 'phone_number')
    op.drop_column('users', 'mfa_backup_codes')
    op.drop_column('users', 'mfa_secret')
    op.drop_column('users', 'mfa_method')
    op.drop_column('users', 'mfa_enabled')
