# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Cost Guard schemas for CodexOS
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, validator
from uuid import UUID


class CostGuardBase(BaseModel):
    """Base cost guard schema"""
    monthly_budget_cents: int = Field(..., description="Monthly budget in cents")
    soft_cap_percentage: float = Field(80.0, description="Warning threshold percentage")
    hard_cap_percentage: float = Field(100.0, description="Hard stop threshold percentage")
    emergency_cap_percentage: float = Field(120.0, description="Emergency measures threshold percentage")
    auto_downgrade_enabled: bool = Field(True, description="Enable automatic model downgrading")
    downgrade_models: Dict[str, Any] = Field(default_factory=dict, description="Model downgrade mapping")
    fallback_models: List[str] = Field(default_factory=list, description="Fallback model priority")
    alert_emails: List[str] = Field(default_factory=list, description="Email addresses for alerts")
    webhook_urls: List[str] = Field(default_factory=list, description="Webhook URLs for notifications")
    slack_channels: List[str] = Field(default_factory=list, description="Slack channels for notifications")
    allow_override: bool = Field(False, description="Allow manual budget overrides")


class CostGuardCreate(CostGuardBase):
    """Schema for creating cost guards"""
    tenant_id: UUID = Field(..., description="Tenant ID")


class CostGuardUpdate(BaseModel):
    """Schema for updating cost guards"""
    monthly_budget_cents: Optional[int] = Field(None, description="Updated monthly budget")
    soft_cap_percentage: Optional[float] = Field(None, description="Updated soft cap percentage")
    hard_cap_percentage: Optional[float] = Field(None, description="Updated hard cap percentage")
    emergency_cap_percentage: Optional[float] = Field(None, description="Updated emergency cap percentage")
    auto_downgrade_enabled: Optional[bool] = Field(None, description="Updated auto-downgrade setting")
    downgrade_models: Optional[Dict[str, Any]] = Field(None, description="Updated downgrade mapping")
    fallback_models: Optional[List[str]] = Field(None, description="Updated fallback models")
    alert_emails: Optional[List[str]] = Field(None, description="Updated alert emails")
    webhook_urls: Optional[List[str]] = Field(None, description="Updated webhook URLs")
    slack_channels: Optional[List[str]] = Field(None, description="Updated Slack channels")
    allow_override: Optional[bool] = Field(None, description="Updated override permission")


class CostGuardResponse(CostGuardBase):
    """Schema for cost guard responses"""
    id: UUID
    tenant_id: UUID
    current_month_spending_cents: int
    current_month_start: datetime
    last_spending_update: datetime
    status: str
    status_updated_at: datetime
    warning_threshold_cents: int
    soft_cap_threshold_cents: int
    hard_cap_threshold_cents: int
    emergency_threshold_cents: int
    actions_taken: List[Dict[str, Any]]
    last_action_at: Optional[datetime]
    last_action_type: Optional[str]
    cost_breakdown: Dict[str, Any]
    override_reason: Optional[str]
    override_by: Optional[UUID]
    override_until: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CostGuardStatusResponse(BaseModel):
    """Schema for cost guard status responses"""
    tenant_id: str
    status: str
    current_spending_cents: int
    budget_limit_cents: int
    spending_percentage: float
    next_threshold_cents: Optional[int]
    next_threshold_percentage: Optional[float]
    status_updated_at: datetime
    can_execute: bool
    warnings: List[str]


class CostGuardExecutionCheckRequest(BaseModel):
    """Schema for checking if execution is allowed"""
    estimated_cost_cents: int = Field(..., description="Estimated execution cost in cents")
    requested_models: Optional[List[str]] = Field(None, description="Requested LLM models")


class CostGuardExecutionCheckResponse(BaseModel):
    """Schema for execution check responses"""
    can_execute: bool
    status: str
    current_spending: int
    budget_limit: int
    estimated_cost: int
    recommended_models: List[str]
    warnings: List[str]
    blocked_reason: Optional[str]


class CostGuardSpendingUpdateRequest(BaseModel):
    """Schema for updating spending"""
    additional_cost_cents: int = Field(..., description="Additional cost to add")
    execution_id: Optional[UUID] = Field(None, description="Execution ID for tracking")
    cost_breakdown: Optional[Dict[str, Any]] = Field(None, description="Detailed cost breakdown")


class CostGuardBudgetOverrideRequest(BaseModel):
    """Schema for budget override requests"""
    reason: str = Field(..., description="Reason for override")
    duration_hours: int = Field(24, description="Override duration in hours")


class CostGuardBudgetOverrideResponse(BaseModel):
    """Schema for budget override responses"""
    override_reason: str
    override_by: str
    override_until: datetime
    status: str
    warnings: List[str]


class CostGuardRecommendationsResponse(BaseModel):
    """Schema for budget recommendations responses"""
    recommendations: List[Dict[str, Any]]
    status: str
    current_spending: int
    budget_limit: int
    spending_percentage: float


class CostGuardAnalyticsRequest(BaseModel):
    """Schema for cost analytics requests"""
    days: int = Field(30, description="Number of days to analyze")


class CostGuardAnalyticsResponse(BaseModel):
    """Schema for cost analytics responses"""
    period_days: int
    total_cost_cents: int
    total_executions: int
    successful_executions: int
    success_rate: float
    average_cost_per_execution: float
    daily_costs: Dict[str, int]
    model_costs: Dict[str, int]
    tool_costs: Dict[str, int]
    cost_trend: str


class CostGuardFilter(BaseModel):
    """Schema for filtering cost guards"""
    status: Optional[str] = Field(None, description="Filter by status")
    min_budget: Optional[int] = Field(None, description="Minimum budget filter")
    max_budget: Optional[int] = Field(None, description="Maximum budget filter")
    auto_downgrade_enabled: Optional[bool] = Field(None, description="Filter by auto-downgrade setting")
    allow_override: Optional[bool] = Field(None, description="Filter by override permission")
    has_active_override: Optional[bool] = Field(None, description="Filter by active override status")


class CostGuardBulkUpdateRequest(BaseModel):
    """Schema for bulk updating cost guards"""
    tenant_ids: List[UUID] = Field(..., description="List of tenant IDs to update")
    updates: CostGuardUpdate = Field(..., description="Updates to apply")


class CostGuardBulkUpdateResponse(BaseModel):
    """Schema for bulk update responses"""
    updated_count: int
    failed_count: int
    failed_tenant_ids: List[str]
    errors: List[str]
