"""RBAC Enhancements: Execution Timeline, Agent Manifests, Cost Guard

Revision ID: 004
Revises: 003_add_mfa_fields
Create Date: 2024-12-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003_add_mfa_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Create execution_steps table
    op.create_table('execution_steps',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('execution_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('execution_node_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('step_number', sa.Integer(), nullable=False),
        sa.Column('step_type', sa.String(length=100), nullable=False),
        sa.Column('step_name', sa.String(length=255), nullable=False),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('intermediate_data', sa.JSON(), nullable=True),
        sa.Column('tool_name', sa.String(length=255), nullable=True),
        sa.Column('tool_parameters', sa.JSON(), nullable=True),
        sa.Column('tool_result', sa.JSON(), nullable=True),
        sa.Column('model_name', sa.String(length=255), nullable=True),
        sa.Column('prompt_tokens', sa.Integer(), nullable=True),
        sa.Column('completion_tokens', sa.Integer(), nullable=True),
        sa.Column('temperature', sa.Float(), nullable=True),
        sa.Column('max_tokens', sa.Integer(), nullable=True),
        sa.Column('query', sa.Text(), nullable=True),
        sa.Column('retrieved_documents', sa.JSON(), nullable=True),
        sa.Column('relevance_scores', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('cost_cents', sa.Integer(), nullable=True),
        sa.Column('cost_breakdown', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=True),
        sa.Column('can_replay_from', sa.Boolean(), nullable=False),
        sa.Column('replay_dependencies', sa.JSON(), nullable=True),
        sa.Column('extra_data', sa.JSON(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['execution_id'], ['executions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['execution_node_id'], ['execution_nodes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for execution_steps
    op.create_index('idx_execution_step_execution_number', 'execution_steps', ['execution_id', 'step_number'])
    op.create_index('idx_execution_step_type', 'execution_steps', ['step_type'])
    op.create_index('idx_execution_step_timing', 'execution_steps', ['started_at', 'completed_at'])
    op.create_index('idx_execution_step_replay', 'execution_steps', ['can_replay_from'])
    
    # Create agent_manifests table
    op.create_table('agent_manifests',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('agent_flow_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('manifest_hash', sa.String(length=255), nullable=False),
        sa.Column('signature', sa.Text(), nullable=False),
        sa.Column('signed_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('signed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('capabilities', sa.JSON(), nullable=False),
        sa.Column('supported_models', sa.JSON(), nullable=False),
        sa.Column('multimodal_support', sa.JSON(), nullable=False),
        sa.Column('allowed_tools', sa.JSON(), nullable=False),
        sa.Column('tool_permissions', sa.JSON(), nullable=False),
        sa.Column('restricted_tools', sa.JSON(), nullable=False),
        sa.Column('max_tokens_per_execution', sa.Integer(), nullable=True),
        sa.Column('max_cost_per_execution', sa.Integer(), nullable=True),
        sa.Column('max_executions_per_day', sa.Integer(), nullable=True),
        sa.Column('max_concurrent_executions', sa.Integer(), nullable=True),
        sa.Column('data_access_level', sa.String(length=50), nullable=False),
        sa.Column('allowed_data_sources', sa.JSON(), nullable=False),
        sa.Column('data_retention_policy', sa.String(length=50), nullable=False),
        sa.Column('security_level', sa.String(length=50), nullable=False),
        sa.Column('compliance_requirements', sa.JSON(), nullable=False),
        sa.Column('audit_requirements', sa.JSON(), nullable=False),
        sa.Column('deployment_environment', sa.String(length=50), nullable=False),
        sa.Column('runtime_constraints', sa.JSON(), nullable=False),
        sa.Column('health_check_endpoints', sa.JSON(), nullable=False),
        sa.Column('marketplace_visibility', sa.String(length=50), nullable=False),
        sa.Column('sharing_permissions', sa.JSON(), nullable=False),
        sa.Column('licensing_terms', sa.Text(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('verified_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verification_notes', sa.Text(), nullable=True),
        sa.Column('manifest_content', sa.JSON(), nullable=False),
        sa.Column('manifest_yaml', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['agent_flow_id'], ['agent_flows.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['signed_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['verified_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('manifest_hash')
    )
    
    # Create indexes for agent_manifests
    op.create_index('idx_agent_manifest_flow_version', 'agent_manifests', ['agent_flow_id', 'version'])
    op.create_index('idx_agent_manifest_tenant', 'agent_manifests', ['tenant_id'])
    op.create_index('idx_agent_manifest_verified', 'agent_manifests', ['is_verified'])
    
    # Create cost_guards table
    op.create_table('cost_guards',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('monthly_budget_cents', sa.Integer(), nullable=False),
        sa.Column('soft_cap_percentage', sa.Float(), nullable=False),
        sa.Column('hard_cap_percentage', sa.Float(), nullable=False),
        sa.Column('emergency_cap_percentage', sa.Float(), nullable=False),
        sa.Column('current_month_spending_cents', sa.Integer(), nullable=False),
        sa.Column('current_month_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_spending_update', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('status_updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('auto_downgrade_enabled', sa.Boolean(), nullable=False),
        sa.Column('downgrade_models', sa.JSON(), nullable=False),
        sa.Column('fallback_models', sa.JSON(), nullable=False),
        sa.Column('alert_emails', sa.JSON(), nullable=False),
        sa.Column('webhook_urls', sa.JSON(), nullable=False),
        sa.Column('slack_channels', sa.JSON(), nullable=False),
        sa.Column('warning_threshold_cents', sa.Integer(), nullable=False),
        sa.Column('soft_cap_threshold_cents', sa.Integer(), nullable=False),
        sa.Column('hard_cap_threshold_cents', sa.Integer(), nullable=False),
        sa.Column('emergency_threshold_cents', sa.Integer(), nullable=False),
        sa.Column('actions_taken', sa.JSON(), nullable=False),
        sa.Column('last_action_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_action_type', sa.String(length=100), nullable=True),
        sa.Column('cost_breakdown', sa.JSON(), nullable=False),
        sa.Column('allow_override', sa.Boolean(), nullable=False),
        sa.Column('override_reason', sa.Text(), nullable=True),
        sa.Column('override_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('override_until', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['override_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for cost_guards
    op.create_index('idx_cost_guard_tenant_status', 'cost_guards', ['tenant_id', 'status'])
    op.create_index('idx_cost_guard_status', 'cost_guards', ['status'])
    op.create_index('idx_cost_guard_spending', 'cost_guards', ['current_month_spending_cents'])
    
    # Add new columns to executions table
    op.add_column('executions', sa.Column('can_replay', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('executions', sa.Column('replay_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('executions', sa.Column('original_execution_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_executions_original_execution', 'executions', 'executions', ['original_execution_id'], ['id'])
    
    # Add new columns to agent_flows table
    op.add_column('agent_flows', sa.Column('requires_manifest', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('agent_flows', sa.Column('manifest_version_required', sa.String(length=50), nullable=True))
    
    # Add new columns to tenants table for cost guard integration
    op.add_column('tenants', sa.Column('cost_guard_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('tenants', sa.Column('default_monthly_budget_cents', sa.Integer(), nullable=True))
    op.add_column('tenants', sa.Column('cost_alert_threshold', sa.Float(), nullable=False, server_default='80.0'))


def downgrade():
    # Remove cost guard columns from tenants
    op.drop_column('tenants', 'cost_alert_threshold')
    op.drop_column('tenants', 'default_monthly_budget_cents')
    op.drop_column('tenants', 'cost_guard_enabled')
    
    # Remove manifest columns from agent_flows
    op.drop_column('agent_flows', 'manifest_version_required')
    op.drop_column('agent_flows', 'requires_manifest')
    
    # Remove replay columns from executions
    op.drop_constraint('fk_executions_original_execution', 'executions', type_='foreignkey')
    op.drop_column('executions', 'original_execution_id')
    op.drop_column('executions', 'replay_count')
    op.drop_column('executions', 'can_replay')
    
    # Drop cost_guards table
    op.drop_index('idx_cost_guard_spending', table_name='cost_guards')
    op.drop_index('idx_cost_guard_status', table_name='cost_guards')
    op.drop_index('idx_cost_guard_tenant_status', table_name='cost_guards')
    op.drop_table('cost_guards')
    
    # Drop agent_manifests table
    op.drop_index('idx_agent_manifest_verified', table_name='agent_manifests')
    op.drop_index('idx_agent_manifest_tenant', table_name='agent_manifests')
    op.drop_index('idx_agent_manifest_flow_version', table_name='agent_manifests')
    op.drop_table('agent_manifests')
    
    # Drop execution_steps table
    op.drop_index('idx_execution_step_replay', table_name='execution_steps')
    op.drop_index('idx_execution_step_timing', table_name='execution_steps')
    op.drop_index('idx_execution_step_type', table_name='execution_steps')
    op.drop_index('idx_execution_step_execution_number', table_name='execution_steps')
    op.drop_table('execution_steps')
