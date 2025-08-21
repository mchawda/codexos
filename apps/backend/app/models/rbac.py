# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Role-based access control models for CodexOS
"""

from uuid import uuid4
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Index, UniqueConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class SystemRole(str, Enum):
    """System-defined roles"""
    SUPER_ADMIN = "super_admin"  # CodexOS platform admin
    TENANT_ADMIN = "tenant_admin"  # Full access within tenant
    TEAM_LEAD = "team_lead"  # Manage team and workflows
    DEVELOPER = "developer"  # Create and run agents
    ANALYST = "analyst"  # Read-only access with analytics
    VIEWER = "viewer"  # Read-only access


class ResourceType(str, Enum):
    """Resource types for permissions"""
    TENANT = "tenant"
    USER = "user"
    ROLE = "role"
    AGENT = "agent"
    EXECUTION = "execution"
    RAG = "rag"
    VAULT = "vault"
    API_KEY = "api_key"
    MARKETPLACE = "marketplace"
    BILLING = "billing"
    ANALYTICS = "analytics"
    AUDIT = "audit"


class ActionType(str, Enum):
    """Action types for permissions"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    EXECUTE = "execute"
    PUBLISH = "publish"
    SHARE = "share"
    EXPORT = "export"
    IMPORT = "import"
    APPROVE = "approve"
    MANAGE = "manage"  # Full access to resource
    ALL = "*"  # All actions


class Role(Base, TimestampMixin):
    """
    Role model for RBAC
    Roles are tenant-specific and can be customized
    """
    __tablename__ = "roles"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(100), nullable=False)
    display_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Role properties
    is_system_role = Column(Boolean, default=False)  # Cannot be modified/deleted
    is_default = Column(Boolean, default=False)  # Auto-assigned to new users
    is_active = Column(Boolean, default=True)
    
    # Role hierarchy
    parent_role_id = Column(PGUUID(as_uuid=True), ForeignKey("roles.id"), nullable=True)
    priority = Column(Integer, default=0)  # Higher priority overrides lower
    
    # Metadata
    metadata = Column(JSONB, default={})
    
    # Relationships
    tenant = relationship("Tenant", back_populates="roles")
    users = relationship("User", secondary="user_roles", back_populates="roles")
    permissions = relationship("Permission", secondary="role_permissions", back_populates="roles")
    parent_role = relationship("Role", remote_side=[id])
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('tenant_id', 'name', name='uq_tenant_role_name'),
        Index('idx_role_tenant_active', 'tenant_id', 'is_active'),
    )
    
    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}', tenant_id={self.tenant_id})>"


class Permission(Base, TimestampMixin):
    """
    Permission model for fine-grained access control
    Format: resource:action (e.g., "agent:create", "vault:read")
    """
    __tablename__ = "permissions"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(100), nullable=False)  # e.g., "agent:create"
    display_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Permission components
    resource = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    
    # Conditions (JSON-based rules)
    conditions = Column(JSONB, default={})  # e.g., {"owner_only": true, "team_only": true}
    
    # Permission properties
    is_system_permission = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Metadata
    metadata = Column(JSONB, default={})
    
    # Relationships
    tenant = relationship("Tenant", back_populates="permissions")
    roles = relationship("Role", secondary="role_permissions", back_populates="permissions")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('tenant_id', 'name', name='uq_tenant_permission_name'),
        Index('idx_permission_tenant_resource_action', 'tenant_id', 'resource', 'action'),
    )
    
    def __repr__(self):
        return f"<Permission(id={self.id}, name='{self.name}', resource='{self.resource}', action='{self.action}')>"
    
    def matches(self, resource: str, action: str) -> bool:
        """Check if permission matches the given resource and action"""
        resource_match = self.resource == "*" or self.resource == resource
        action_match = self.action == "*" or self.action == action
        return resource_match and action_match


# Default system roles and their permissions
DEFAULT_ROLES = {
    SystemRole.SUPER_ADMIN: {
        'display_name': 'Super Administrator',
        'description': 'Full system access across all tenants (CodexOS platform admin)',
        'is_system_role': True,
        'permissions': ['*:*']  # All permissions
    },
    SystemRole.TENANT_ADMIN: {
        'display_name': 'Tenant Administrator',
        'description': 'Full access within the tenant',
        'is_system_role': True,
        'permissions': [
            'tenant:manage',
            'user:*', 'role:*', 'agent:*', 'execution:*',
            'rag:*', 'vault:*', 'api_key:*', 'marketplace:*',
            'billing:*', 'analytics:*', 'audit:read'
        ]
    },
    SystemRole.TEAM_LEAD: {
        'display_name': 'Team Lead',
        'description': 'Manage team members and agent workflows',
        'is_system_role': True,
        'permissions': [
            'user:read', 'user:update', 'user:create',
            'role:read', 
            'agent:*', 'execution:*',
            'rag:*', 'vault:read', 'vault:create', 'vault:update',
            'api_key:create', 'api_key:read', 'api_key:delete',
            'marketplace:read', 'marketplace:publish',
            'analytics:read', 'audit:read'
        ]
    },
    SystemRole.DEVELOPER: {
        'display_name': 'Developer',
        'description': 'Create and execute AI agents',
        'is_system_role': True,
        'is_default': True,  # Default role for new users
        'permissions': [
            'user:read',
            'agent:create', 'agent:read', 'agent:update', 'agent:execute',
            'execution:create', 'execution:read',
            'rag:create', 'rag:read', 'rag:update',
            'vault:read', 'vault:create',
            'api_key:create', 'api_key:read',
            'marketplace:read',
            'analytics:read'
        ]
    },
    SystemRole.ANALYST: {
        'display_name': 'Data Analyst',
        'description': 'Analyze data and generate reports',
        'is_system_role': True,
        'permissions': [
            'user:read',
            'agent:read', 'execution:read',
            'rag:read',
            'analytics:read', 'analytics:export',
            'audit:read'
        ]
    },
    SystemRole.VIEWER: {
        'display_name': 'Viewer',
        'description': 'Read-only access to resources',
        'is_system_role': True,
        'permissions': [
            'user:read',
            'agent:read', 'execution:read',
            'rag:read',
            'marketplace:read'
        ]
    }
}

# Permission definitions for the system
SYSTEM_PERMISSIONS = [
    # Tenant permissions
    ("tenant:manage", "Manage Tenant", "Full tenant management access"),
    ("tenant:read", "View Tenant", "View tenant information"),
    ("tenant:update", "Update Tenant", "Update tenant settings"),
    
    # User permissions
    ("user:create", "Create Users", "Create new users"),
    ("user:read", "View Users", "View user profiles"),
    ("user:update", "Update Users", "Update user information"),
    ("user:delete", "Delete Users", "Remove users"),
    ("user:manage", "Manage Users", "Full user management"),
    
    # Role permissions
    ("role:create", "Create Roles", "Create custom roles"),
    ("role:read", "View Roles", "View role definitions"),
    ("role:update", "Update Roles", "Modify role permissions"),
    ("role:delete", "Delete Roles", "Remove custom roles"),
    ("role:manage", "Manage Roles", "Full role management"),
    
    # Agent permissions
    ("agent:create", "Create Agents", "Create AI agent workflows"),
    ("agent:read", "View Agents", "View agent configurations"),
    ("agent:update", "Update Agents", "Modify agent workflows"),
    ("agent:delete", "Delete Agents", "Remove agents"),
    ("agent:execute", "Execute Agents", "Run agent workflows"),
    ("agent:publish", "Publish Agents", "Publish to marketplace"),
    ("agent:share", "Share Agents", "Share with team members"),
    
    # Execution permissions
    ("execution:create", "Start Executions", "Start agent executions"),
    ("execution:read", "View Executions", "View execution history"),
    ("execution:update", "Update Executions", "Modify running executions"),
    ("execution:delete", "Delete Executions", "Remove execution history"),
    
    # RAG permissions
    ("rag:create", "Ingest Documents", "Add documents to RAG"),
    ("rag:read", "Search Documents", "Search RAG knowledge base"),
    ("rag:update", "Update Documents", "Modify document metadata"),
    ("rag:delete", "Delete Documents", "Remove documents from RAG"),
    
    # Vault permissions
    ("vault:create", "Create Secrets", "Store secrets in vault"),
    ("vault:read", "View Secrets", "Access vault secrets"),
    ("vault:update", "Update Secrets", "Modify vault entries"),
    ("vault:delete", "Delete Secrets", "Remove vault entries"),
    
    # API Key permissions
    ("api_key:create", "Create API Keys", "Generate API keys"),
    ("api_key:read", "View API Keys", "List API keys"),
    ("api_key:delete", "Delete API Keys", "Revoke API keys"),
    
    # Marketplace permissions
    ("marketplace:read", "Browse Marketplace", "View marketplace items"),
    ("marketplace:publish", "Publish to Marketplace", "Publish agents/templates"),
    ("marketplace:purchase", "Purchase from Marketplace", "Buy marketplace items"),
    
    # Billing permissions
    ("billing:read", "View Billing", "View billing information"),
    ("billing:manage", "Manage Billing", "Update payment methods"),
    
    # Analytics permissions
    ("analytics:read", "View Analytics", "Access analytics dashboards"),
    ("analytics:export", "Export Analytics", "Export analytics data"),
    
    # Audit permissions
    ("audit:read", "View Audit Logs", "Access audit trail"),
    ("audit:export", "Export Audit Logs", "Export audit data"),
]
