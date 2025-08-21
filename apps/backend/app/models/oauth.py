# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
OAuth2/OIDC models for Auth0 and SSO integration
"""

from uuid import uuid4
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class IdentityProviderType(str, Enum):
    """Supported identity providers"""
    AUTH0 = "auth0"
    OKTA = "okta"
    AZURE_AD = "azure_ad"
    GOOGLE = "google"
    GITHUB = "github"
    SAML = "saml"
    OIDC = "oidc"


class TenantOAuthConfig(Base, TimestampMixin):
    """
    OAuth configuration for tenant-specific SSO
    Supports Auth0, Okta, Azure AD, and generic OIDC/SAML
    """
    __tablename__ = "tenant_oauth_configs"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Provider information
    provider_type = Column(String(50), nullable=False)
    provider_name = Column(String(255), nullable=False)  # Display name
    
    # OAuth2/OIDC configuration
    client_id = Column(String(255), nullable=False)
    client_secret = Column(Text, nullable=False)  # Encrypted
    
    # Provider URLs
    issuer_url = Column(String(500))  # OIDC issuer URL
    authorization_url = Column(String(500), nullable=False)
    token_url = Column(String(500), nullable=False)
    userinfo_url = Column(String(500))
    jwks_url = Column(String(500))  # JSON Web Key Set URL
    
    # SAML configuration (if applicable)
    saml_entity_id = Column(String(500))
    saml_sso_url = Column(String(500))
    saml_certificate = Column(Text)  # Encrypted
    saml_metadata_url = Column(String(500))
    
    # Redirect configuration
    redirect_uri = Column(String(500), nullable=False)
    logout_redirect_uri = Column(String(500))
    
    # Scopes and claims
    scopes = Column(ARRAY(String), default=['openid', 'profile', 'email'])
    
    # User field mapping
    user_id_claim = Column(String(100), default='sub')
    email_claim = Column(String(100), default='email')
    name_claim = Column(String(100), default='name')
    groups_claim = Column(String(100), default='groups')
    
    # Domain restrictions
    email_domains = Column(ARRAY(String), default=[])  # Allowed email domains
    
    # Configuration flags
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Default SSO for tenant
    auto_provision = Column(Boolean, default=True)  # Auto-create users
    sync_groups = Column(Boolean, default=False)  # Sync groups as roles
    
    # Additional settings
    settings = Column(JSONB, default={})
    
    # Relationships
    tenant = relationship("Tenant", back_populates="oauth_configs")
    oauth_users = relationship("OAuthUser", back_populates="oauth_config", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('tenant_id', 'provider_type', 'client_id', name='uq_tenant_oauth_provider'),
        Index('idx_oauth_config_tenant_active', 'tenant_id', 'is_active'),
    )


class OAuthUser(Base, TimestampMixin):
    """
    OAuth user mapping
    Links OAuth provider users to CodexOS users
    """
    __tablename__ = "oauth_users"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    oauth_config_id = Column(PGUUID(as_uuid=True), ForeignKey("tenant_oauth_configs.id", ondelete="CASCADE"), nullable=False)
    
    # Provider user information
    provider_user_id = Column(String(255), nullable=False)  # sub/uid from provider
    provider_email = Column(String(255))
    provider_name = Column(String(255))
    provider_picture = Column(String(500))
    
    # Provider data
    provider_data = Column(JSONB, default={})  # Full user info from provider
    provider_groups = Column(ARRAY(String), default=[])  # Groups from provider
    
    # Token information (encrypted)
    access_token = Column(Text)
    refresh_token = Column(Text)
    id_token = Column(Text)
    token_expires_at = Column(DateTime(timezone=True))
    
    # Session tracking
    last_login_at = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="oauth_accounts")
    oauth_config = relationship("TenantOAuthConfig", back_populates="oauth_users")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('oauth_config_id', 'provider_user_id', name='uq_oauth_provider_user'),
        Index('idx_oauth_user_provider', 'oauth_config_id', 'provider_user_id'),
    )


class AuthEventType(str, Enum):
    """Authentication event types for audit"""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    TOKEN_REFRESH = "token_refresh"
    TOKEN_REVOKED = "token_revoked"
    PASSWORD_RESET = "password_reset"
    MFA_ENABLED = "mfa_enabled"
    MFA_DISABLED = "mfa_disabled"
    MFA_VERIFIED = "mfa_verified"
    MFA_FAILED = "mfa_failed"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"


class AuthEvent(Base):
    """
    Authentication event log for security auditing
    """
    __tablename__ = "auth_events"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=True)
    
    event_type = Column(String(50), nullable=False)
    event_data = Column(JSONB, default={})
    
    # Request information
    ip_address = Column(String(45))
    user_agent = Column(Text)
    device_fingerprint = Column(String(255))
    
    # Geolocation
    country_code = Column(String(2))
    city = Column(String(100))
    
    # Risk assessment
    risk_score = Column(Integer, default=0)  # 0-100
    risk_factors = Column(ARRAY(String), default=[])
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    tenant = relationship("Tenant")
    
    # Indexes
    __table_args__ = (
        Index('idx_auth_event_user_created', 'user_id', 'created_at'),
        Index('idx_auth_event_tenant_created', 'tenant_id', 'created_at'),
        Index('idx_auth_event_type_created', 'event_type', 'created_at'),
    )
