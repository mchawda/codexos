# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Tenant management models for CodexOS
"""

from uuid import uuid4
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, JSON, Index, Table
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class TenantPlan(str, Enum):
    """Tenant subscription plans"""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class TenantStatus(str, Enum):
    """Tenant status"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    EXPIRED = "expired"


class Tenant(Base, TimestampMixin):
    """
    Tenant model for multi-tenancy
    Each tenant is completely isolated with their own data
    """
    __tablename__ = "tenants"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(255), nullable=True, index=True)  # Custom domain
    subdomain = Column(String(100), unique=True, nullable=True, index=True)  # *.codexos.dev
    
    # Contact information
    contact_email = Column(String(255), nullable=False)
    contact_name = Column(String(255))
    contact_phone = Column(String(50))
    
    # Billing & Limits
    plan = Column(String(50), default=TenantPlan.FREE.value)
    status = Column(String(50), default=TenantStatus.TRIAL.value)
    max_users = Column(Integer, default=5)
    max_agents = Column(Integer, default=10)
    max_rag_documents = Column(Integer, default=100)
    max_api_calls_per_month = Column(Integer, default=10000)
    storage_quota_gb = Column(Integer, default=10)
    
    # Feature flags
    features = Column(JSONB, default={})  # Dynamic feature enablement
    settings = Column(JSONB, default={})  # Tenant-specific settings
    
    # Security
    allowed_ip_ranges = Column(JSONB, default=[])  # IP whitelist
    mfa_required = Column(Boolean, default=False)
    sso_required = Column(Boolean, default=False)
    data_retention_days = Column(Integer, default=90)
    
    # Billing
    stripe_customer_id = Column(String(255), unique=True, nullable=True)
    stripe_subscription_id = Column(String(255), unique=True, nullable=True)
    trial_ends_at = Column(DateTime(timezone=True))
    billing_email = Column(String(255))
    
    # Compliance
    compliance_certifications = Column(JSONB, default=[])  # ["SOC2", "ISO27001", etc]
    data_residency = Column(String(50), default="us")  # us, eu, asia, etc
    
    # Timestamps
    activated_at = Column(DateTime(timezone=True))
    suspended_at = Column(DateTime(timezone=True))
    
    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="tenant", cascade="all, delete-orphan")
    permissions = relationship("Permission", back_populates="tenant", cascade="all, delete-orphan")
    oauth_configs = relationship("TenantOAuthConfig", back_populates="tenant", cascade="all, delete-orphan")
    agent_flows = relationship("AgentFlow", back_populates="tenant", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="tenant", cascade="all, delete-orphan")
    vault_items = relationship("VaultItem", back_populates="tenant", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="tenant", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="tenant", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_tenant_status_plan', 'status', 'plan'),
        Index('idx_tenant_domain_subdomain', 'domain', 'subdomain'),
    )
    
    def __repr__(self):
        return f"<Tenant(id={self.id}, name='{self.name}', slug='{self.slug}')>"
    
    @property
    def is_active(self) -> bool:
        """Check if tenant is active"""
        return self.status == TenantStatus.ACTIVE.value
    
    @property
    def is_trial(self) -> bool:
        """Check if tenant is in trial"""
        return self.status == TenantStatus.TRIAL.value and (
            not self.trial_ends_at or self.trial_ends_at > datetime.utcnow()
        )
    
    def has_feature(self, feature: str) -> bool:
        """Check if tenant has a specific feature enabled"""
        return self.features.get(feature, False) if self.features else False
    
    def get_setting(self, key: str, default=None):
        """Get a tenant setting"""
        return self.settings.get(key, default) if self.settings else default


# Association tables for many-to-many relationships
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', PGUUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', PGUUID(as_uuid=True), ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('assigned_at', DateTime(timezone=True), default=datetime.utcnow),
    Column('assigned_by', PGUUID(as_uuid=True), ForeignKey('users.id'))
)

role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', PGUUID(as_uuid=True), ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', PGUUID(as_uuid=True), ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True),
    Column('granted_at', DateTime(timezone=True), default=datetime.utcnow)
)
