# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Cost Guard Service for CodexOS
Provides per-tenant budget management with soft/hard caps and auto-downgrade
"""

from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from datetime import datetime, timedelta
import json
import logging

from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc

from app.models.tenant import CostGuard, CostGuardStatus, Tenant
from app.models.agent import Execution, ExecutionStep
from app.models.user import User
from app.core.security import get_current_user

logger = logging.getLogger(__name__)


class CostGuardService:
    """Service for managing cost guard and budget enforcement"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_cost_guard(
        self,
        tenant_id: UUID,
        monthly_budget_cents: int,
        soft_cap_percentage: float = 80.0,
        hard_cap_percentage: float = 100.0,
        emergency_cap_percentage: float = 120.0,
        auto_downgrade_enabled: bool = True
    ) -> CostGuard:
        """Create a new cost guard for a tenant"""
        
        # Check if cost guard already exists
        existing = self.db.query(CostGuard).filter(CostGuard.tenant_id == tenant_id).first()
        if existing:
            raise ValueError(f"Cost guard already exists for tenant {tenant_id}")
        
        # Set current month start
        now = datetime.utcnow()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Create cost guard
        cost_guard = CostGuard(
            tenant_id=tenant_id,
            monthly_budget_cents=monthly_budget_cents,
            soft_cap_percentage=soft_cap_percentage,
            hard_cap_percentage=hard_cap_percentage,
            emergency_cap_percentage=emergency_cap_percentage,
            current_month_spending_cents=0,
            current_month_start=current_month_start,
            last_spending_update=now,
            status=CostGuardStatus.NORMAL.value,
            status_updated_at=now,
            auto_downgrade_enabled=auto_downgrade_enabled,
            downgrade_models={
                "gpt-4": {
                    "warning": "gpt-4-turbo",
                    "soft_cap": "gpt-3.5-turbo",
                    "hard_cap": "gpt-3.5-turbo"
                },
                "gpt-4-turbo": {
                    "warning": "gpt-3.5-turbo",
                    "soft_cap": "gpt-3.5-turbo",
                    "hard_cap": "gpt-3.5-turbo"
                },
                "claude-3-opus": {
                    "warning": "claude-3-sonnet",
                    "soft_cap": "claude-3-haiku",
                    "hard_cap": "claude-3-haiku"
                },
                "claude-3-sonnet": {
                    "warning": "claude-3-haiku",
                    "soft_cap": "claude-3-haiku",
                    "hard_cap": "claude-3-haiku"
                }
            },
            fallback_models=["gpt-3.5-turbo", "claude-3-haiku"],
            alert_emails=[],
            webhook_urls=[],
            slack_channels=[],
            actions_taken=[],
            cost_breakdown={},
            allow_override=False
        )
        
        # Calculate thresholds
        cost_guard.calculate_thresholds()
        
        self.db.add(cost_guard)
        self.db.commit()
        self.db.refresh(cost_guard)
        
        logger.info(f"Created cost guard for tenant {tenant_id} with budget {monthly_budget_cents} cents")
        
        return cost_guard
    
    def update_monthly_spending(
        self,
        tenant_id: UUID,
        additional_cost_cents: int,
        execution_id: Optional[UUID] = None,
        cost_breakdown: Optional[Dict[str, Any]] = None
    ) -> CostGuard:
        """Update tenant's monthly spending and check thresholds"""
        
        cost_guard = self.db.query(CostGuard).filter(CostGuard.tenant_id == tenant_id).first()
        if not cost_guard:
            raise ValueError(f"No cost guard found for tenant {tenant_id}")
        
        # Check if we need to reset monthly spending (new month)
        now = datetime.utcnow()
        if now.month != cost_guard.current_month_start.month or now.year != cost_guard.current_month_start.year:
            cost_guard.current_month_spending_cents = 0
            cost_guard.current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            cost_guard.status = CostGuardStatus.NORMAL.value
            cost_guard.status_updated_at = now
        
        # Update spending
        old_spending = cost_guard.current_month_spending_cents
        cost_guard.current_month_spending_cents += additional_cost_cents
        cost_guard.last_spending_update = now
        
        # Update cost breakdown
        if cost_breakdown:
            if execution_id:
                execution_key = str(execution_id)
                cost_guard.cost_breakdown[execution_key] = cost_breakdown
            
            # Aggregate by service type
            for service, cost in cost_breakdown.items():
                if service not in cost_guard.cost_breakdown:
                    cost_guard.cost_breakdown[service] = 0
                cost_guard.cost_breakdown[service] += cost
        
        # Check thresholds and update status
        self._check_and_update_status(cost_guard, old_spending)
        
        self.db.commit()
        self.db.refresh(cost_guard)
        
        logger.info(f"Updated spending for tenant {tenant_id}: {old_spending} -> {cost_guard.current_month_spending_cents} cents")
        
        return cost_guard
    
    def can_execute_agent(
        self,
        tenant_id: UUID,
        estimated_cost_cents: int,
        requested_models: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Check if agent execution is allowed based on budget status"""
        
        cost_guard = self.db.query(CostGuard).filter(CostGuard.tenant_id == tenant_id).first()
        if not cost_guard:
            # No cost guard means unlimited execution
            return {
                "can_execute": True,
                "status": "unlimited",
                "recommended_models": requested_models or [],
                "warnings": []
            }
        
        # Check if execution is allowed
        can_execute = cost_guard.can_execute_agent(estimated_cost_cents)
        
        result = {
            "can_execute": can_execute,
            "status": cost_guard.status,
            "current_spending": cost_guard.current_month_spending_cents,
            "budget_limit": cost_guard.monthly_budget_cents,
            "estimated_cost": estimated_cost_cents,
            "recommended_models": requested_models or [],
            "warnings": []
        }
        
        if not can_execute:
            result["warnings"].append(f"Execution blocked due to budget status: {cost_guard.status}")
        
        # Get recommended models if auto-downgrade is enabled
        if cost_guard.auto_downgrade_enabled and requested_models:
            recommended_models = []
            for model in requested_models:
                recommended_model = cost_guard.get_recommended_model(model)
                if recommended_model != model:
                    result["warnings"].append(f"Model {model} downgraded to {recommended_model} due to budget status")
                recommended_models.append(recommended_model)
            result["recommended_models"] = recommended_models
        
        return result
    
    def get_budget_recommendations(
        self,
        tenant_id: UUID
    ) -> Dict[str, Any]:
        """Get budget optimization recommendations"""
        
        cost_guard = self.db.query(CostGuard).filter(CostGuard.tenant_id == tenant_id).first()
        if not cost_guard:
            return {"recommendations": [], "status": "no_cost_guard"}
        
        recommendations = []
        
        # Check spending patterns
        if cost_guard.current_month_spending_cents > cost_guard.warning_threshold_cents:
            recommendations.append({
                "type": "warning",
                "message": f"Current spending ({cost_guard.current_month_spending_cents} cents) exceeds warning threshold ({cost_guard.warning_threshold_cents} cents)",
                "action": "Monitor spending closely and consider reducing usage"
            })
        
        # Check cost breakdown for optimization opportunities
        if cost_guard.cost_breakdown:
            # Find highest cost services
            service_costs = [(service, cost) for service, cost in cost_guard.cost_breakdown.items() 
                           if isinstance(cost, (int, float)) and service != "total"]
            
            if service_costs:
                service_costs.sort(key=lambda x: x[1], reverse=True)
                top_service, top_cost = service_costs[0]
                
                if top_cost > cost_guard.monthly_budget_cents * 0.5:  # More than 50% of budget
                    recommendations.append({
                        "type": "optimization",
                        "message": f"Service '{top_service}' consumes {top_cost} cents ({top_cost/cost_guard.monthly_budget_cents*100:.1f}% of budget)",
                        "action": "Consider optimizing or limiting usage of this service"
                    })
        
        # Check if auto-downgrade is disabled
        if not cost_guard.auto_downgrade_enabled:
            recommendations.append({
                "type": "info",
                "message": "Auto-downgrade is disabled",
                "action": "Consider enabling auto-downgrade to automatically reduce costs when approaching limits"
            })
        
        return {
            "recommendations": recommendations,
            "status": cost_guard.status,
            "current_spending": cost_guard.current_month_spending_cents,
            "budget_limit": cost_guard.monthly_budget_cents,
            "spending_percentage": (cost_guard.current_month_spending_cents / cost_guard.monthly_budget_cents * 100) if cost_guard.monthly_budget_cents > 0 else 0
        }
    
    def override_budget_limit(
        self,
        tenant_id: UUID,
        override_user: User,
        reason: str,
        duration_hours: int = 24
    ) -> CostGuard:
        """Temporarily override budget limits"""
        
        cost_guard = self.db.query(CostGuard).filter(CostGuard.tenant_id == tenant_id).first()
        if not cost_guard:
            raise ValueError(f"No cost guard found for tenant {tenant_id}")
        
        if not cost_guard.allow_override:
            raise ValueError("Budget override is not allowed for this tenant")
        
        # Set override
        cost_guard.override_reason = reason
        cost_guard.override_by = override_user.id
        cost_guard.override_until = datetime.utcnow() + timedelta(hours=duration_hours)
        
        # Record action
        action = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": "budget_override",
            "user": str(override_user.id),
            "reason": reason,
            "duration_hours": duration_hours,
            "spending_at_override": cost_guard.current_month_spending_cents
        }
        cost_guard.actions_taken.append(action)
        cost_guard.last_action_at = datetime.utcnow()
        cost_guard.last_action_type = "budget_override"
        
        self.db.commit()
        self.db.refresh(cost_guard)
        
        logger.warning(f"Budget override for tenant {tenant_id} by user {override_user.id}: {reason}")
        
        return cost_guard
    
    def get_cost_analytics(
        self,
        tenant_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get cost analytics for a tenant"""
        
        # Get executions in the specified period
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        executions = self.db.query(Execution).filter(
            and_(
                Execution.tenant_id == tenant_id,
                Execution.created_at >= cutoff_date
            )
        ).all()
        
        # Get execution steps for detailed breakdown
        execution_ids = [execution.id for execution in executions]
        steps = self.db.query(ExecutionStep).filter(
            ExecutionStep.execution_id.in_(execution_ids)
        ).all()
        
        # Calculate analytics
        total_cost = sum(step.cost_cents or 0 for step in steps)
        total_executions = len(executions)
        successful_executions = len([e for e in executions if e.status == "completed"])
        
        # Cost by day
        daily_costs = {}
        for execution in executions:
            date_key = execution.created_at.date().isoformat()
            if date_key not in daily_costs:
                daily_costs[date_key] = 0
            daily_costs[date_key] += execution.cost_cents or 0
        
        # Cost by model
        model_costs = {}
        for step in steps:
            if step.model_name:
                if step.model_name not in model_costs:
                    model_costs[step.model_name] = 0
                model_costs[step.model_name] += step.cost_cents or 0
        
        # Cost by tool
        tool_costs = {}
        for step in steps:
            if step.tool_name:
                if step.tool_name not in tool_costs:
                    tool_costs[step.tool_name] = 0
                tool_costs[step.tool_name] += step.cost_cents or 0
        
        return {
            "period_days": days,
            "total_cost_cents": total_cost,
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "success_rate": (successful_executions / total_executions * 100) if total_executions > 0 else 0,
            "average_cost_per_execution": (total_cost / total_executions) if total_executions > 0 else 0,
            "daily_costs": daily_costs,
            "model_costs": model_costs,
            "tool_costs": tool_costs,
            "cost_trend": "increasing" if len(daily_costs) > 1 and list(daily_costs.values())[-1] > list(daily_costs.values())[0] else "stable"
        }
    
    def _check_and_update_status(self, cost_guard: CostGuard, old_spending: int) -> None:
        """Check thresholds and update cost guard status"""
        
        current_spending = cost_guard.current_month_spending_cents
        old_status = cost_guard.status
        
        # Determine new status based on spending
        if current_spending >= cost_guard.emergency_threshold_cents:
            new_status = CostGuardStatus.EMERGENCY.value
        elif current_spending >= cost_guard.hard_cap_threshold_cents:
            new_status = CostGuardStatus.HARD_CAP.value
        elif current_spending >= cost_guard.soft_cap_threshold_cents:
            new_status = CostGuardStatus.SOFT_CAP.value
        elif current_spending >= cost_guard.warning_threshold_cents:
            new_status = CostGuardStatus.WARNING.value
        else:
            new_status = CostGuardStatus.NORMAL.value
        
        # Update status if changed
        if new_status != old_status:
            cost_guard.update_status(new_status)
            
            # Log status change
            logger.warning(
                f"Cost guard status changed for tenant {cost_guard.tenant_id}: "
                f"{old_status} -> {new_status} (spending: {old_spending} -> {current_spending} cents)"
            )
            
            # Send alerts if configured
            self._send_status_alerts(cost_guard, old_status, new_status)
    
    def _send_status_alerts(self, cost_guard: CostGuard, old_status: str, new_status: str) -> None:
        """Send alerts when cost guard status changes"""
        
        # This would integrate with your notification system
        # For now, just log the alert
        
        alert_message = (
            f"Cost Guard Alert: Tenant {cost_guard.tenant_id} status changed from "
            f"{old_status} to {new_status}. Current spending: {cost_guard.current_month_spending_cents} cents"
        )
        
        logger.warning(alert_message)
        
        # TODO: Implement actual alert sending
        # - Email alerts
        # - Webhook notifications
        # - Slack notifications
        # - SMS alerts for emergency status
    
    def cleanup_expired_overrides(self) -> int:
        """Clean up expired budget overrides"""
        
        now = datetime.utcnow()
        expired_overrides = self.db.query(CostGuard).filter(
            and_(
                CostGuard.override_until.isnot(None),
                CostGuard.override_until < now
            )
        ).all()
        
        cleaned_count = 0
        for cost_guard in expired_overrides:
            cost_guard.override_reason = None
            cost_guard.override_by = None
            cost_guard.override_until = None
            
            # Record action
            action = {
                "timestamp": now.isoformat(),
                "action": "override_expired",
                "spending_at_expiry": cost_guard.current_month_spending_cents
            }
            cost_guard.actions_taken.append(action)
            
            cleaned_count += 1
        
        if cleaned_count > 0:
            self.db.commit()
            logger.info(f"Cleaned up {cleaned_count} expired budget overrides")
        
        return cleaned_count
