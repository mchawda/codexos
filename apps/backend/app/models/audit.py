# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Audit logging models for compliance and security
SOC2 Type II and ISO 27001 compliant audit trail
"""

from uuid import uuid4
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Index, BigInteger, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY
from sqlalchemy.orm import relationship

from app.db.base import Base


class AuditEventCategory(str, Enum):
    """Categories of audit events"""
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    CONFIGURATION = "configuration"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    SYSTEM = "system"
    API = "api"


class AuditEventType(str, Enum):
    """Specific audit event types"""
    # Authentication events
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_LOGIN_FAILED = "user_login_failed"
    TOKEN_CREATED = "token_created"
    TOKEN_REVOKED = "token_revoked"
    MFA_VERIFIED = "mfa_verified"
    MFA_FAILED = "mfa_failed"
    
    # User management
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_ACTIVATED = "user_activated"
    USER_DEACTIVATED = "user_deactivated"
    PASSWORD_CHANGED = "password_changed"
    PASSWORD_RESET = "password_reset"
    
    # Role and permission management
    ROLE_CREATED = "role_created"
    ROLE_UPDATED = "role_updated"
    ROLE_DELETED = "role_deleted"
    ROLE_ASSIGNED = "role_assigned"
    ROLE_REVOKED = "role_revoked"
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_REVOKED = "permission_revoked"
    
    # Agent operations
    AGENT_CREATED = "agent_created"
    AGENT_UPDATED = "agent_updated"
    AGENT_DELETED = "agent_deleted"
    AGENT_EXECUTED = "agent_executed"
    AGENT_SHARED = "agent_shared"
    AGENT_PUBLISHED = "agent_published"
    
    # Data operations
    DATA_ACCESSED = "data_accessed"
    DATA_CREATED = "data_created"
    DATA_UPDATED = "data_updated"
    DATA_DELETED = "data_deleted"
    DATA_EXPORTED = "data_exported"
    DATA_IMPORTED = "data_imported"
    
    # Vault operations
    VAULT_ITEM_CREATED = "vault_item_created"
    VAULT_ITEM_ACCESSED = "vault_item_accessed"
    VAULT_ITEM_UPDATED = "vault_item_updated"
    VAULT_ITEM_DELETED = "vault_item_deleted"
    VAULT_ITEM_SHARED = "vault_item_shared"
    VAULT_ITEM_ROTATED = "vault_item_rotated"
    
    # RAG operations
    DOCUMENT_INGESTED = "document_ingested"
    DOCUMENT_DELETED = "document_deleted"
    DOCUMENT_SEARCHED = "document_searched"
    
    # Security events
    SECURITY_ALERT = "security_alert"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ACCESS_DENIED = "access_denied"
    IP_BLOCKED = "ip_blocked"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    
    # Configuration changes
    TENANT_SETTINGS_UPDATED = "tenant_settings_updated"
    SECURITY_SETTINGS_UPDATED = "security_settings_updated"
    INTEGRATION_CONFIGURED = "integration_configured"
    WEBHOOK_CONFIGURED = "webhook_configured"
    
    # Compliance events
    COMPLIANCE_REPORT_GENERATED = "compliance_report_generated"
    DATA_RETENTION_APPLIED = "data_retention_applied"
    DATA_ANONYMIZED = "data_anonymized"
    GDPR_REQUEST_PROCESSED = "gdpr_request_processed"


class AuditLog(Base):
    """
    Comprehensive audit log for all system activities
    Immutable records for compliance and security
    """
    __tablename__ = "audit_logs"
    
    # Use BigInteger for ID to handle high volume
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # Event identification
    event_id = Column(PGUUID(as_uuid=True), default=uuid4, unique=True, nullable=False)
    event_category = Column(String(50), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_name = Column(String(255), nullable=False)
    
    # Tenant and user context
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    impersonator_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))  # If action was impersonated
    
    # Resource information
    resource_type = Column(String(100))  # agent, user, document, etc.
    resource_id = Column(String(255))  # ID of the affected resource
    resource_name = Column(String(255))  # Human-readable name
    
    # Event details
    action = Column(String(100), nullable=False)  # create, read, update, delete, execute
    outcome = Column(String(50), nullable=False)  # success, failure, partial
    error_message = Column(Text)
    
    # Change tracking
    old_values = Column(JSONB)  # Previous state (for updates)
    new_values = Column(JSONB)  # New state (for updates)
    changed_fields = Column(ARRAY(String))  # List of modified fields
    
    # Request context
    ip_address = Column(String(45))
    user_agent = Column(Text)
    request_id = Column(String(255))  # For tracing across services
    session_id = Column(String(255))
    
    # API context
    api_endpoint = Column(String(500))
    api_method = Column(String(10))  # GET, POST, PUT, DELETE
    api_version = Column(String(20))
    api_key_id = Column(PGUUID(as_uuid=True))  # If API key was used
    
    # Geolocation
    country_code = Column(String(2))
    region = Column(String(100))
    city = Column(String(100))
    
    # Additional metadata
    extra_data = Column(JSONB, default={})
    tags = Column(ARRAY(String), default=[])
    
    # Risk and compliance
    risk_score = Column(Integer, default=0)  # 0-100
    compliance_flags = Column(ARRAY(String), default=[])  # SOC2, HIPAA, GDPR flags
    
    # Timestamp (immutable)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    # Data integrity
    checksum = Column(String(255))  # SHA-256 of critical fields for tamper detection
    
    # Relationships
    tenant = relationship("Tenant", back_populates="audit_logs")
    user = relationship("User", foreign_keys=[user_id])
    impersonator = relationship("User", foreign_keys=[impersonator_id])
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_audit_tenant_created', 'tenant_id', 'created_at'),
        Index('idx_audit_user_created', 'user_id', 'created_at'),
        Index('idx_audit_event_type_created', 'event_type', 'created_at'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_category_outcome', 'event_category', 'outcome'),
        Index('idx_audit_request_id', 'request_id'),
        Index('idx_audit_compliance', 'compliance_flags'),
    )
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, event='{self.event_type}', user={self.user_id}, resource='{self.resource_type}:{self.resource_id}')>"


class ComplianceReport(Base):
    """
    Generated compliance reports for auditors
    """
    __tablename__ = "compliance_reports"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Report details
    report_type = Column(String(50), nullable=False)  # SOC2, ISO27001, GDPR, HIPAA
    report_period_start = Column(DateTime(timezone=True), nullable=False)
    report_period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Report content
    report_data = Column(JSONB, nullable=False)
    summary = Column(Text)
    findings = Column(JSONB, default=[])
    recommendations = Column(JSONB, default=[])
    
    # Generation details
    generated_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    generated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    generation_duration_seconds = Column(Integer)
    
    # File storage
    file_path = Column(String(500))  # S3 or local path
    file_size_bytes = Column(BigInteger)
    file_hash = Column(String(255))  # SHA-256
    
    # Verification
    verified_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    verified_at = Column(DateTime(timezone=True))
    verification_notes = Column(Text)
    
    # Relationships
    tenant = relationship("Tenant")
    generator = relationship("User", foreign_keys=[generated_by])
    verifier = relationship("User", foreign_keys=[verified_by])
    
    # Indexes
    __table_args__ = (
        Index('idx_compliance_report_tenant_type', 'tenant_id', 'report_type'),
        Index('idx_compliance_report_period', 'report_period_start', 'report_period_end'),
    )
