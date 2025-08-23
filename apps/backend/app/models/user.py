# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
User management models for CodexOS
"""

from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Column, DateTime, Enum as SQLEnum, String, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from app.db.base import Base, TimestampMixin


class UserRole(str, Enum):
    """Legacy user roles - migrating to RBAC"""

    SYSTEM_ADMIN = "system_admin"
    ORG_ADMIN = "org_admin"
    TEAM_LEAD = "team_lead"
    DEVELOPER = "developer"
    VIEWER = "viewer"


class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_ACTIVATION = "pending_activation"
    LOCKED = "locked"


class User(Base, TimestampMixin):
    """
    User model with multi-tenancy and RBAC support
    Enhanced with enterprise security features
    """

    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Tenant relationship (multi-tenancy)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True)
    
    # Basic information
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500))
    
    # Authentication
    hashed_password = Column(String(255), nullable=True)  # Nullable for SSO-only users
    
    # Status and verification
    status = Column(String(50), default=UserStatus.PENDING_ACTIVATION.value)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime(timezone=True))
    
    # Legacy role (for backward compatibility)
    role = Column(SQLEnum(UserRole), default=UserRole.DEVELOPER, nullable=False)
    
    # RBAC - moved to many-to-many relationship
    is_superuser = Column(Boolean, default=False)  # Platform super admin
    
    # Multi-factor Authentication
    mfa_enabled = Column(Boolean, default=False)
    mfa_method = Column(String(50))  # totp, sms, email
    mfa_secret = Column(Text)  # Encrypted TOTP secret
    mfa_backup_codes = Column(Text)  # Encrypted backup codes
    phone_number = Column(String(20))  # For SMS MFA
    
    # Organization relationship
    organization_id = Column(PGUUID(as_uuid=True), nullable=True)
    department = Column(String(255))
    job_title = Column(String(255))
    
    # Preferences and settings
    preferences = Column(JSONB, default={})
    ui_settings = Column(JSONB, default={})
    notification_settings = Column(JSONB, default={})
    
    # OAuth providers (legacy - moving to oauth_users table)
    google_id = Column(String(255), unique=True, nullable=True)
    github_id = Column(String(255), unique=True, nullable=True)
    
    # Security
    last_login_at = Column(DateTime(timezone=True))
    last_login_ip = Column(String(45))
    last_login_location = Column(String(255))  # City, Country
    password_changed_at = Column(DateTime(timezone=True))
    password_expires_at = Column(DateTime(timezone=True))
    
    # MFA settings
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255))  # Encrypted
    mfa_backup_codes = Column(ARRAY(String), default=[])  # Encrypted
    mfa_methods = Column(ARRAY(String), default=[])  # totp, sms, email, webauthn
    
    # Account security
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    must_change_password = Column(Boolean, default=False)
    
    # API access
    api_access_enabled = Column(Boolean, default=True)
    rate_limit_tier = Column(String(50), default="standard")  # standard, premium, unlimited
    
    # Compliance
    consent_given_at = Column(DateTime(timezone=True))
    consent_ip = Column(String(45))
    data_retention_until = Column(DateTime(timezone=True))
    deletion_requested_at = Column(DateTime(timezone=True))
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    roles = relationship("Role", secondary="user_roles", back_populates="users")
    oauth_accounts = relationship("OAuthUser", back_populates="user", cascade="all, delete-orphan")
    agent_flows = relationship("AgentFlow", back_populates="owner", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    vault_items = relationship("SecureVault", foreign_keys="SecureVault.user_id", back_populates="user")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    marketplace_items = relationship("MarketplaceItem", foreign_keys="MarketplaceItem.seller_id", back_populates="seller")
    
    @hybrid_property
    def is_tenant_admin(self) -> bool:
        """Check if user is a tenant admin"""
        if self.is_superuser:
            return True
        return any(role.name == "tenant_admin" for role in self.roles)
    
    def has_permission(self, resource: str, action: str) -> bool:
        """Check if user has a specific permission"""
        if self.is_superuser:
            return True
        
        for role in self.roles:
            for permission in role.permissions:
                if permission.matches(resource, action):
                    return True
        return False
    
    def has_role(self, role_name: str) -> bool:
        """Check if user has a specific role"""
        return any(role.name == role_name for role in self.roles)
    
    def get_permissions(self) -> set:
        """Get all permissions for the user"""
        permissions = set()
        for role in self.roles:
            for permission in role.permissions:
                permissions.add(f"{permission.resource}:{permission.action}")
        return permissions
