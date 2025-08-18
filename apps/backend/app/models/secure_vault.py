"""
Secure Vault models for encrypted credential storage
AES-256-GCM encryption with key derivation
"""

from uuid import uuid4
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class VaultItemType(str, Enum):
    """Types of vault items"""
    API_KEY = "api_key"
    DATABASE_CREDENTIAL = "database_credential"
    SSH_KEY = "ssh_key"
    CERTIFICATE = "certificate"
    PASSWORD = "password"
    TOKEN = "token"
    SECRET = "secret"
    OAUTH_CREDENTIAL = "oauth_credential"
    ENCRYPTION_KEY = "encryption_key"
    WEBHOOK_SECRET = "webhook_secret"


class VaultItemStatus(str, Enum):
    """Vault item status"""
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    PENDING_ROTATION = "pending_rotation"


class SecureVault(Base, TimestampMixin):
    """
    Secure vault for storing encrypted credentials and secrets
    All sensitive data is encrypted using AES-256-GCM
    """
    __tablename__ = "secure_vault_items"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Item identification
    name = Column(String(255), nullable=False)
    description = Column(Text)
    item_type = Column(String(50), nullable=False)
    
    # Encrypted data
    encrypted_value = Column(Text, nullable=False)  # AES-256-GCM encrypted
    encryption_key_id = Column(String(255), nullable=False)  # Key rotation tracking
    nonce = Column(String(255), nullable=False)  # Unique per encryption
    auth_tag = Column(String(255), nullable=False)  # GCM authentication tag
    
    # Additional encrypted fields (for structured data)
    encrypted_metadata = Column(Text)  # JSON encrypted separately
    
    # Access control
    owner_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    shared_with_users = Column(ARRAY(PGUUID(as_uuid=True)), default=[])
    shared_with_roles = Column(ARRAY(PGUUID(as_uuid=True)), default=[])
    
    # Security settings
    requires_mfa = Column(Boolean, default=False)
    ip_whitelist = Column(ARRAY(String), default=[])
    
    # Lifecycle
    status = Column(String(50), default=VaultItemStatus.ACTIVE.value)
    expires_at = Column(DateTime(timezone=True))
    last_accessed_at = Column(DateTime(timezone=True))
    last_rotated_at = Column(DateTime(timezone=True))
    rotation_reminder_days = Column(Integer)  # Reminder before expiry
    
    # Usage tracking
    access_count = Column(Integer, default=0)
    last_accessed_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    
    # Integration
    agent_flow_ids = Column(ARRAY(PGUUID(as_uuid=True)), default=[])  # Agents using this secret
    environment = Column(String(50), default="production")  # dev, staging, production
    
    # Tags and search
    tags = Column(ARRAY(String), default=[])
    search_vector = Column(Text)  # For full-text search on name/description
    
    # Audit
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    modified_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relationships
    tenant = relationship("Tenant", back_populates="vault_items")
    user = relationship("User", foreign_keys=[user_id], back_populates="vault_items")
    owner = relationship("User", foreign_keys=[owner_id])
    creator = relationship("User", foreign_keys=[created_by])
    modifier = relationship("User", foreign_keys=[modified_by])
    last_accessor = relationship("User", foreign_keys=[last_accessed_by])
    access_logs = relationship("VaultAccessLog", back_populates="vault_item", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('tenant_id', 'name', name='uq_tenant_vault_name'),
        Index('idx_vault_tenant_type_status', 'tenant_id', 'item_type', 'status'),
        Index('idx_vault_tenant_owner', 'tenant_id', 'owner_id'),
        Index('idx_vault_expiry', 'expires_at'),
    )
    
    def __repr__(self):
        return f"<SecureVault(id={self.id}, name='{self.name}', type='{self.item_type}')>"


class VaultAccessLog(Base):
    """
    Audit log for vault access
    Tracks all access to sensitive vault items
    """
    __tablename__ = "vault_access_logs"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    vault_item_id = Column(PGUUID(as_uuid=True), ForeignKey("secure_vault_items.id", ondelete="CASCADE"), nullable=False)
    
    # Access details
    accessed_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    access_type = Column(String(50), nullable=False)  # read, update, share, rotate
    access_granted = Column(Boolean, nullable=False)
    denial_reason = Column(String(255))
    
    # Context
    agent_flow_id = Column(PGUUID(as_uuid=True), ForeignKey("agent_flows.id"))
    execution_id = Column(PGUUID(as_uuid=True), ForeignKey("executions.id"))
    
    # Request information
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # MFA verification
    mfa_verified = Column(Boolean, default=False)
    mfa_method = Column(String(50))  # totp, sms, email, webauthn
    
    # Timestamp
    accessed_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    vault_item = relationship("SecureVault", back_populates="access_logs")
    user = relationship("User")
    agent_flow = relationship("AgentFlow")
    execution = relationship("Execution")
    
    # Indexes
    __table_args__ = (
        Index('idx_vault_access_item_time', 'vault_item_id', 'accessed_at'),
        Index('idx_vault_access_user_time', 'accessed_by', 'accessed_at'),
    )


class VaultEncryptionKey(Base, TimestampMixin):
    """
    Encryption key management for vault
    Supports key rotation and versioning
    """
    __tablename__ = "vault_encryption_keys"
    
    id = Column(String(255), primary_key=True)  # Key ID for reference
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Key material (encrypted with master key)
    encrypted_key = Column(Text, nullable=False)  # The actual encryption key, encrypted
    key_version = Column(Integer, nullable=False)
    algorithm = Column(String(50), default="AES-256-GCM")
    
    # Key lifecycle
    is_active = Column(Boolean, default=True)
    activated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    deactivated_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    
    # Key derivation info
    kdf_algorithm = Column(String(50), default="PBKDF2")  # or "scrypt", "argon2"
    kdf_iterations = Column(Integer, default=100000)
    salt = Column(String(255), nullable=False)
    
    # Usage tracking
    items_encrypted = Column(Integer, default=0)
    last_used_at = Column(DateTime(timezone=True))
    
    # Relationships
    tenant = relationship("Tenant")
    
    # Indexes
    __table_args__ = (
        Index('idx_vault_key_tenant_active', 'tenant_id', 'is_active'),
        Index('idx_vault_key_version', 'tenant_id', 'key_version'),
    )
