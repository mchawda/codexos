"""Add agent execution history and detailed logging

Revision ID: 002
Revises: 001
Create Date: 2024-01-15 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create agent_flows table (replacing the old agents table structure)
    op.create_table('agent_flows',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.UUID(), nullable=False),
        sa.Column('nodes', sa.JSON(), nullable=False),
        sa.Column('edges', sa.JSON(), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False, default='1.0.0'),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_template', sa.Boolean(), nullable=False, default=False),
        sa.Column('multimodal_enabled', sa.Boolean(), nullable=False, default=False),
        sa.Column('execution_count', sa.Integer(), nullable=False, default=0),
        sa.Column('success_rate', sa.Float(), nullable=False, default=0.0),
        sa.Column('marketplace_id', sa.UUID(), nullable=True),
        sa.Column('price', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE')
    )

    # Create executions table (replacing the old agent_executions table)
    op.create_table('executions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('flow_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, default='pending'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('logs', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=False, default=0),
        sa.Column('cost_cents', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['flow_id'], ['agent_flows.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )

    # Create execution_nodes table for detailed node-level logging
    op.create_table('execution_nodes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('execution_id', sa.UUID(), nullable=False),
        sa.Column('node_id', sa.String(length=255), nullable=False),
        sa.Column('node_type', sa.String(length=100), nullable=False),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['execution_id'], ['executions.id'], ondelete='CASCADE')
    )

    # Create indexes for performance
    op.create_index('ix_agent_flows_tenant_id', 'agent_flows', ['tenant_id'])
    op.create_index('ix_agent_flows_owner_id', 'agent_flows', ['owner_id'])
    op.create_index('ix_agent_flows_marketplace_id', 'agent_flows', ['marketplace_id'])
    op.create_index('ix_executions_tenant_id', 'executions', ['tenant_id'])
    op.create_index('ix_executions_flow_id', 'executions', ['flow_id'])
    op.create_index('ix_executions_user_id', 'executions', ['user_id'])
    op.create_index('ix_executions_status', 'executions', ['status'])
    op.create_index('ix_executions_started_at', 'executions', ['started_at'])
    op.create_index('ix_execution_nodes_execution_id', 'execution_nodes', ['execution_id'])
    op.create_index('ix_execution_nodes_node_id', 'execution_nodes', ['node_id'])
    op.create_index('ix_execution_nodes_status', 'execution_nodes', ['status'])

    # Add TTL cleanup column to executions table
    op.add_column('executions', sa.Column('ttl_days', sa.Integer(), nullable=True, default=30))


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_execution_nodes_status', 'execution_nodes')
    op.drop_index('ix_execution_nodes_node_id', 'execution_nodes')
    op.drop_index('ix_execution_nodes_execution_id', 'execution_nodes')
    op.drop_index('ix_executions_started_at', 'executions')
    op.drop_index('ix_executions_status', 'executions')
    op.drop_index('ix_executions_user_id', 'executions')
    op.drop_index('ix_executions_flow_id', 'executions')
    op.drop_index('ix_executions_tenant_id', 'executions')
    op.drop_index('ix_agent_flows_marketplace_id', 'agent_flows')
    op.drop_index('ix_agent_flows_owner_id', 'agent_flows')
    op.drop_index('ix_agent_flows_tenant_id', 'agent_flows')

    # Drop tables
    op.drop_table('execution_nodes')
    op.drop_table('executions')
    op.drop_table('agent_flows')
