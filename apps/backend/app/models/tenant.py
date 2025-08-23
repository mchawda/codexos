# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Tenant management models for CodexOS
"""

from uuid import uuid4
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, JSON, Index, Table, Float
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


class CostGuardStatus(str, Enum):
    """Cost guard status for budget management"""
    NORMAL = "normal"
    WARNING = "warning"
    SOFT_CAP = "soft_cap"
    HARD_CAP = "hard_cap"
    EMERGENCY = "emergency"


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
    cost_guards = relationship("CostGuard", back_populates="tenant", cascade="all, delete-orphan")
    
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


class CostGuard(Base, TimestampMixin):
    """Cost guard system for per-tenant budget management with auto-downgrade"""
    
    __tablename__ = "cost_guards"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Budget configuration
    monthly_budget_cents = Column(Integer, nullable=False, default=0)  # Monthly budget in cents
    soft_cap_percentage = Column(Float, nullable=False, default=80.0)  # Warning at 80%
    hard_cap_percentage = Column(Float, nullable=False, default=100.0)  # Hard stop at 100%
    emergency_cap_percentage = Column(Float, nullable=False, default=120.0)  # Emergency measures at 120%
    
    # Current spending
    current_month_spending_cents = Column(Integer, nullable=False, default=0)
    current_month_start = Column(DateTime(timezone=True), nullable=False)
    last_spending_update = Column(DateTime(timezone=True), nullable=False)
    
    # Cost guard status
    status = Column(String(50), nullable=False, default=CostGuardStatus.NORMAL.value)
    status_updated_at = Column(DateTime(timezone=True), nullable=False)
    
    # Auto-downgrade configuration
    auto_downgrade_enabled = Column(Boolean, default=True, nullable=False)
    downgrade_models = Column(JSONB, nullable=False, default=dict)  # Model downgrade mapping
    fallback_models = Column(JSONB, nullable=False, default=list)  # Fallback model priority
    
    # Alert configuration
    alert_emails = Column(JSONB, nullable=False, default=list)  # Email addresses for alerts
    webhook_urls = Column(JSONB, nullable=False, default=list)  # Webhook URLs for notifications
    slack_channels = Column(JSONB, nullable=False, default=list)  # Slack channels for notifications
    
    # Thresholds and actions
    warning_threshold_cents = Column(Integer, nullable=False)  # Calculated warning threshold
    soft_cap_threshold_cents = Column(Integer, nullable=False)  # Calculated soft cap threshold
    hard_cap_threshold_cents = Column(Integer, nullable=False)  # Calculated hard cap threshold
    emergency_threshold_cents = Column(Integer, nullable=False)  # Calculated emergency threshold
    
    # Actions taken
    actions_taken = Column(JSONB, nullable=False, default=list)  # List of actions taken
    last_action_at = Column(DateTime(timezone=True), nullable=True)
    last_action_type = Column(String(100), nullable=True)
    
    # Cost breakdown by service
    cost_breakdown = Column(JSONB, nullable=False, default=dict)  # Costs by service/agent
    
    # Override settings
    allow_override = Column(Boolean, default=False, nullable=False)  # Allow manual override
    override_reason = Column(Text, nullable=True)
    override_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    override_until = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="cost_guards")
    override_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_cost_guard_tenant_status', 'tenant_id', 'status'),
        Index('idx_cost_guard_status', 'status'),
        Index('idx_cost_guard_spending', 'current_month_spending_cents'),
    )
    
    def __repr__(self):
        return f"<CostGuard(id={self.id}, tenant={self.tenant_id}, status='{self.status}')>"
    
    def calculate_thresholds(self):
        """Calculate all threshold values based on budget and percentages"""
        self.warning_threshold_cents = int(self.monthly_budget_cents * (self.soft_cap_percentage / 100))
        self.soft_cap_threshold_cents = int(self.monthly_budget_cents * (self.soft_cap_percentage / 100))
        self.hard_cap_threshold_cents = int(self.monthly_budget_cents * (self.hard_cap_percentage / 100))
        self.emergency_threshold_cents = int(self.monthly_budget_cents * (self.emergency_cap_percentage / 100))
    
    def update_status(self, new_status: str):
        """Update cost guard status and record the change"""
        self.status = new_status
        self.status_updated_at = datetime.utcnow()
        
        # Record action
        action = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": "status_change",
            "old_status": self.status,
            "new_status": new_status,
            "spending_at_change": self.current_month_spending_cents
        }
        self.actions_taken.append(action)
        self.last_action_at = datetime.utcnow()
        self.last_action_type = "status_change"
    
    def can_execute_agent(self, estimated_cost_cents: int) -> bool:
        """Check if agent execution is allowed based on current budget status"""
        if self.status == CostGuardStatus.EMERGENCY.value:
            return False
        
        if self.status == CostGuardStatus.HARD_CAP.value:
            return False
        
        # Check if execution would exceed hard cap
        if self.current_month_spending_cents + estimated_cost_cents > self.hard_cap_threshold_cents:
            return False
        
        return True
    
    def get_recommended_model(self, original_model: str) -> str:
        """Get recommended downgraded model based on current budget status"""
        if not self.auto_downgrade_enabled:
            return original_model
        
        if self.status == CostGuardStatus.NORMAL.value:
            return original_model
        
        # Get downgrade mapping for this model
        downgrade_map = self.downgrade_models.get(original_model, {})
        
        if self.status == CostGuardStatus.WARNING.value:
            return downgrade_map.get("warning", original_model)
        elif self.status == CostGuardStatus.SOFT_CAP.value:
            return downgrade_map.get("soft_cap", original_model)
        elif self.status == CostGuardStatus.HARD_CAP.value:
            return downgrade_map.get("hard_cap", original_model)
        
        return original_model
