# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Agent flow models for visual workflow system"""

from enum import Enum
from uuid import uuid4
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class NodeType(str, Enum):
    """Supported node types in agent flows"""

    ENTRY = "entry"
    EXIT = "exit"
    LLM = "llm"
    TOOL = "tool"
    RAG = "rag"
    VAULT = "vault"
    CONDITION = "condition"
    VISION = "vision"
    VOICE = "voice"
    ACTION = "action"


class AgentManifest(Base, TimestampMixin):
    """Signed agent manifest with capabilities, tools, entitlements, and budgets"""
    
    __tablename__ = "agent_manifests"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_flow_id = Column(PGUUID(as_uuid=True), ForeignKey("agent_flows.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Manifest metadata
    version = Column(String(50), nullable=False, default="1.0.0")
    manifest_hash = Column(String(255), nullable=False, unique=True)  # SHA-256 of manifest content
    signature = Column(Text, nullable=False)  # Digital signature
    signed_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    signed_at = Column(DateTime(timezone=True), nullable=False)
    
    # Agent capabilities
    capabilities = Column(JSON, nullable=False, default=list)  # List of capability strings
    supported_models = Column(JSON, nullable=False, default=list)  # List of supported LLM models
    multimodal_support = Column(JSON, nullable=False, default=list)  # text, image, audio, video
    
    # Tool entitlements
    allowed_tools = Column(JSON, nullable=False, default=list)  # List of allowed tool names
    tool_permissions = Column(JSON, nullable=False, default=dict)  # Tool-specific permissions
    restricted_tools = Column(JSON, nullable=False, default=list)  # Tools explicitly forbidden
    
    # Resource limits and budgets
    max_tokens_per_execution = Column(Integer, nullable=True)  # Token limit per run
    max_cost_per_execution = Column(Integer, nullable=True)  # Cost limit in cents per run
    max_executions_per_day = Column(Integer, nullable=True)  # Daily execution limit
    max_concurrent_executions = Column(Integer, nullable=True)  # Concurrent execution limit
    
    # Data access permissions
    data_access_level = Column(String(50), nullable=False, default="tenant")  # tenant, user, public
    allowed_data_sources = Column(JSON, nullable=False, default=list)  # RAG collections, vaults, etc.
    data_retention_policy = Column(String(50), nullable=False, default="execution")  # execution, session, persistent
    
    # Security and compliance
    security_level = Column(String(50), nullable=False, default="standard")  # standard, high, enterprise
    compliance_requirements = Column(JSON, nullable=False, default=list)  # SOC2, HIPAA, GDPR, etc.
    audit_requirements = Column(JSON, nullable=False, default=list)  # Required audit fields
    
    # Deployment and runtime
    deployment_environment = Column(String(50), nullable=False, default="production")  # dev, staging, production
    runtime_constraints = Column(JSON, nullable=False, default=dict)  # Memory, CPU, network limits
    health_check_endpoints = Column(JSON, nullable=False, default=list)  # Health check URLs
    
    # Marketplace and sharing
    marketplace_visibility = Column(String(50), nullable=False, default="private")  # private, team, public
    sharing_permissions = Column(JSON, nullable=False, default=list)  # Who can use this agent
    licensing_terms = Column(Text, nullable=True)  # License text
    
    # Validation and verification
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    # Manifest content (the actual manifest file)
    manifest_content = Column(JSON, nullable=False)  # Full manifest as JSON
    manifest_yaml = Column(Text, nullable=False)  # Full manifest as YAML
    
    # Relationships
    agent_flow = relationship("AgentFlow", back_populates="manifests")
    tenant = relationship("Tenant")
    signer = relationship("User", foreign_keys=[signed_by])
    verifier = relationship("User", foreign_keys=[verified_by])
    
    # Indexes
    __table_args__ = (
        Index('idx_agent_manifest_flow_version', 'agent_flow_id', 'version'),
        Index('idx_agent_manifest_hash', 'manifest_hash'),
        Index('idx_agent_manifest_tenant', 'tenant_id'),
        Index('idx_agent_manifest_verified', 'is_verified'),
    )
    
    def __repr__(self):
        return f"<AgentManifest(id={self.id}, version='{self.version}', agent_flow={self.agent_flow_id})>"


class AgentFlow(Base, TimestampMixin):
    """Agent flow definition with nodes and edges - multi-tenant"""

    __tablename__ = "agent_flows"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Flow configuration
    nodes = Column(JSON, nullable=False, default=list)  # List of node objects
    edges = Column(JSON, nullable=False, default=list)  # List of edge objects
    
    # Metadata
    version = Column(String(50), default="1.0.0", nullable=False)
    tags = Column(JSON, nullable=True)  # List of tags
    is_public = Column(Boolean, default=False, nullable=False)
    is_template = Column(Boolean, default=False, nullable=False)
    
    # Multimodal flags
    multimodal_enabled = Column(Boolean, default=False, nullable=False)
    
    # Statistics
    execution_count = Column(Integer, default=0, nullable=False)
    success_rate = Column(Float, default=0.0, nullable=False)
    
    # Marketplace
    marketplace_id = Column(PGUUID(as_uuid=True), nullable=True)
    price = Column(Integer, nullable=True)  # Price in cents
    
    # Manifest requirements
    requires_manifest = Column(Boolean, default=False, nullable=False)
    manifest_version_required = Column(String(50), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="agent_flows")
    owner = relationship("User", back_populates="agent_flows")
    executions = relationship("Execution", back_populates="flow", cascade="all, delete-orphan")
    manifests = relationship("AgentManifest", back_populates="agent_flow", cascade="all, delete-orphan")


class Execution(Base, TimestampMixin):
    """Agent flow execution history and results - multi-tenant"""

    __tablename__ = "executions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    flow_id = Column(PGUUID(as_uuid=True), ForeignKey("agent_flows.id"), nullable=False)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Execution status
    status = Column(String(50), nullable=False)  # pending, running, completed, failed
    
    # Timing
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Input/Output
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    
    # Logs and errors
    logs = Column(JSON, nullable=True)  # List of log entries
    error_message = Column(Text, nullable=True)
    
    # Resource usage
    tokens_used = Column(Integer, default=0, nullable=False)
    cost_cents = Column(Integer, default=0, nullable=False)
    
    # TTL for cleanup
    ttl_days = Column(Integer, default=30, nullable=True)
    
    # Replay capabilities
    can_replay = Column(Boolean, default=True, nullable=False)
    replay_count = Column(Integer, default=0, nullable=False)
    original_execution_id = Column(PGUUID(as_uuid=True), ForeignKey("executions.id"), nullable=True)
    
    # Relationships
    flow = relationship("AgentFlow", back_populates="executions")
    user = relationship("User", back_populates="executions")
    execution_nodes = relationship("ExecutionNode", back_populates="execution", cascade="all, delete-orphan")
    execution_steps = relationship("ExecutionStep", back_populates="execution", cascade="all, delete-orphan")
    original_execution = relationship("Execution", remote_side=[id])
    replay_executions = relationship("Execution", remote_side=[original_execution_id])


class ExecutionNode(Base, TimestampMixin):
    """Detailed node-level execution tracking"""

    __tablename__ = "execution_nodes"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    execution_id = Column(PGUUID(as_uuid=True), ForeignKey("executions.id", ondelete="CASCADE"), nullable=False)
    
    # Node identification
    node_id = Column(String(255), nullable=False)
    node_type = Column(String(100), nullable=False)
    
    # Input/Output data
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    
    # Timing
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    # Status
    status = Column(String(50), nullable=False, default="pending")  # pending, running, completed, failed
    
    # Error handling
    error_message = Column(Text, nullable=True)
    
    # Additional metadata
    extra_data = Column(JSON, nullable=True)  # Tool names, model info, etc.
    
    # Relationships
    execution = relationship("Execution", back_populates="execution_nodes")
    execution_steps = relationship("ExecutionStep", back_populates="execution_node", cascade="all, delete-orphan")


class ExecutionStep(Base, TimestampMixin):
    """Granular step-by-step execution tracking for replay capabilities"""
    
    __tablename__ = "execution_steps"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    execution_id = Column(PGUUID(as_uuid=True), ForeignKey("executions.id", ondelete="CASCADE"), nullable=False)
    execution_node_id = Column(PGUUID(as_uuid=True), ForeignKey("execution_nodes.id", ondelete="CASCADE"), nullable=False)
    
    # Step identification
    step_number = Column(Integer, nullable=False)  # Sequential step number
    step_type = Column(String(100), nullable=False)  # tool_call, llm_call, rag_query, etc.
    step_name = Column(String(255), nullable=False)  # Human-readable step name
    
    # Input/Output data
    input_data = Column(JSON, nullable=True)  # Step input
    output_data = Column(JSON, nullable=True)  # Step output
    intermediate_data = Column(JSON, nullable=True)  # Data between steps
    
    # Tool-specific data
    tool_name = Column(String(255), nullable=True)
    tool_parameters = Column(JSON, nullable=True)
    tool_result = Column(JSON, nullable=True)
    
    # LLM-specific data
    model_name = Column(String(255), nullable=True)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    temperature = Column(Float, nullable=True)
    max_tokens = Column(Integer, nullable=True)
    
    # RAG-specific data
    query = Column(Text, nullable=True)
    retrieved_documents = Column(JSON, nullable=True)
    relevance_scores = Column(JSON, nullable=True)
    
    # Timing and performance
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    
    # Cost tracking
    cost_cents = Column(Integer, default=0)
    cost_breakdown = Column(JSON, nullable=True)  # Detailed cost breakdown
    
    # Status and error handling
    status = Column(String(50), nullable=False, default="pending")  # pending, running, completed, failed, skipped
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    
    # Replay metadata
    can_replay_from = Column(Boolean, default=True, nullable=False)  # Can replay from this step
    replay_dependencies = Column(JSON, nullable=True)  # Steps this depends on for replay
    
    # Additional metadata
    extra_data = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    
    # Relationships
    execution = relationship("Execution", back_populates="execution_steps")
    execution_node = relationship("ExecutionNode", back_populates="execution_steps")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_execution_step_execution_number', 'execution_id', 'step_number'),
        Index('idx_execution_step_type', 'step_type'),
        Index('idx_execution_step_timing', 'started_at', 'completed_at'),
        Index('idx_execution_step_replay', 'can_replay_from'),
    )
    
    def __repr__(self):
        return f"<ExecutionStep(id={self.id}, step={self.step_number}, type='{self.step_type}', execution={self.execution_id})>"
