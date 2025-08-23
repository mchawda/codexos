# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Agent Manifest schemas for CodexOS
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, validator
from uuid import UUID


class AgentManifestBase(BaseModel):
    """Base agent manifest schema"""
    version: str = Field(..., description="Manifest version")
    capabilities: List[str] = Field(default_factory=list, description="Agent capabilities")
    supported_models: List[str] = Field(default_factory=list, description="Supported LLM models")
    multimodal_support: List[str] = Field(default_factory=list, description="Multimodal support types")
    allowed_tools: List[str] = Field(default_factory=list, description="Allowed tool names")
    tool_permissions: Dict[str, Any] = Field(default_factory=dict, description="Tool-specific permissions")
    restricted_tools: List[str] = Field(default_factory=list, description="Explicitly forbidden tools")
    max_tokens_per_execution: Optional[int] = Field(None, description="Token limit per execution")
    max_cost_per_execution: Optional[int] = Field(None, description="Cost limit in cents per execution")
    max_executions_per_day: Optional[int] = Field(None, description="Daily execution limit")
    max_concurrent_executions: Optional[int] = Field(None, description="Concurrent execution limit")
    data_access_level: str = Field("tenant", description="Data access level (tenant, user, public)")
    allowed_data_sources: List[str] = Field(default_factory=list, description="Allowed data sources")
    data_retention_policy: str = Field("execution", description="Data retention policy")
    security_level: str = Field("standard", description="Security level (standard, high, enterprise)")
    compliance_requirements: List[str] = Field(default_factory=list, description="Compliance requirements")
    audit_requirements: List[str] = Field(default_factory=list, description="Required audit fields")
    deployment_environment: str = Field("production", description="Deployment environment")
    runtime_constraints: Dict[str, Any] = Field(default_factory=dict, description="Runtime constraints")
    health_check_endpoints: List[str] = Field(default_factory=list, description="Health check endpoints")
    marketplace_visibility: str = Field("private", description="Marketplace visibility")
    sharing_permissions: List[str] = Field(default_factory=list, description="Sharing permissions")
    licensing_terms: Optional[str] = Field(None, description="License terms")


class AgentManifestCreate(AgentManifestBase):
    """Schema for creating agent manifests"""
    agent_flow_id: UUID = Field(..., description="Agent flow ID")
    manifest_content: Dict[str, Any] = Field(..., description="Full manifest content")


class AgentManifestUpdate(BaseModel):
    """Schema for updating agent manifests"""
    version: Optional[str] = Field(None, description="New version")
    capabilities: Optional[List[str]] = Field(None, description="Updated capabilities")
    supported_models: Optional[List[str]] = Field(None, description="Updated supported models")
    multimodal_support: Optional[List[str]] = Field(None, description="Updated multimodal support")
    allowed_tools: Optional[List[str]] = Field(None, description="Updated allowed tools")
    tool_permissions: Optional[Dict[str, Any]] = Field(None, description="Updated tool permissions")
    restricted_tools: Optional[List[str]] = Field(None, description="Updated restricted tools")
    max_tokens_per_execution: Optional[int] = Field(None, description="Updated token limit")
    max_cost_per_execution: Optional[int] = Field(None, description="Updated cost limit")
    max_executions_per_day: Optional[int] = Field(None, description="Updated daily limit")
    max_concurrent_executions: Optional[int] = Field(None, description="Updated concurrent limit")
    data_access_level: Optional[str] = Field(None, description="Updated data access level")
    allowed_data_sources: Optional[List[str]] = Field(None, description="Updated data sources")
    data_retention_policy: Optional[str] = Field(None, description="Updated retention policy")
    security_level: Optional[str] = Field(None, description="Updated security level")
    compliance_requirements: Optional[List[str]] = Field(None, description="Updated compliance")
    audit_requirements: Optional[List[str]] = Field(None, description="Updated audit requirements")
    deployment_environment: Optional[str] = Field(None, description="Updated environment")
    runtime_constraints: Optional[Dict[str, Any]] = Field(None, description="Updated constraints")
    health_check_endpoints: Optional[List[str]] = Field(None, description="Updated endpoints")
    marketplace_visibility: Optional[str] = Field(None, description="Updated visibility")
    sharing_permissions: Optional[List[str]] = Field(None, description="Updated permissions")
    licensing_terms: Optional[str] = Field(None, description="Updated license terms")


class AgentManifestResponse(AgentManifestBase):
    """Schema for agent manifest responses"""
    id: UUID
    agent_flow_id: UUID
    tenant_id: UUID
    manifest_hash: str
    signature: str
    signed_by: UUID
    signed_at: datetime
    is_verified: bool
    verified_by: Optional[UUID]
    verified_at: Optional[datetime]
    verification_notes: Optional[str]
    manifest_content: Dict[str, Any]
    manifest_yaml: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AgentManifestVerifyRequest(BaseModel):
    """Schema for manifest verification requests"""
    public_key: str = Field(..., description="Public key for signature verification")


class AgentManifestVerifyResponse(BaseModel):
    """Schema for manifest verification responses"""
    is_valid: bool
    verification_notes: Optional[str]
    verified_at: Optional[datetime]
    verified_by: Optional[UUID]


class AgentManifestComplianceResponse(BaseModel):
    """Schema for manifest compliance validation responses"""
    manifest_id: str
    is_compliant: bool
    warnings: List[str]
    errors: List[str]
    recommendations: List[str]


class AgentManifestEntitlementsRequest(BaseModel):
    """Schema for checking manifest entitlements"""
    requested_tools: List[str] = Field(default_factory=list, description="Requested tools")
    requested_models: List[str] = Field(default_factory=list, description="Requested models")
    estimated_cost_cents: int = Field(..., description="Estimated cost in cents")


class AgentManifestEntitlementsResponse(BaseModel):
    """Schema for manifest entitlements check responses"""
    manifest_id: str
    is_allowed: bool
    warnings: List[str]
    errors: List[str]
    tool_entitlements: Dict[str, str]
    model_entitlements: Dict[str, str]
    cost_entitlements: Dict[str, str]


class AgentManifestVersionResponse(BaseModel):
    """Schema for manifest version responses"""
    id: str
    version: str
    signed_at: datetime
    signed_by: str
    is_verified: bool
    verified_at: Optional[datetime]
    verified_by: Optional[str]
    security_level: str
    compliance_requirements: List[str]
    capabilities: List[str]


class AgentManifestTemplateRequest(BaseModel):
    """Schema for manifest template generation requests"""
    agent_flow_id: UUID = Field(..., description="Agent flow ID for template generation")


class AgentManifestTemplateResponse(BaseModel):
    """Schema for manifest template responses"""
    template: Dict[str, Any]
    suggested_capabilities: List[str]
    suggested_tools: List[str]
    suggested_models: List[str]
    compliance_suggestions: List[str]


class AgentManifestFilter(BaseModel):
    """Schema for filtering agent manifests"""
    version: Optional[str] = Field(None, description="Filter by version")
    security_level: Optional[str] = Field(None, description="Filter by security level")
    is_verified: Optional[bool] = Field(None, description="Filter by verification status")
    compliance_requirements: Optional[List[str]] = Field(None, description="Filter by compliance")
    capabilities: Optional[List[str]] = Field(None, description="Filter by capabilities")
    supported_models: Optional[List[str]] = Field(None, description="Filter by supported models")
    start_date: Optional[datetime] = Field(None, description="Start date filter")
    end_date: Optional[datetime] = Field(None, description="End date filter")
