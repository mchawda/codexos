# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""Service for managing agent execution history and cleanup"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, and_

from app.models.agent import Execution, ExecutionNode
from app.core.config import settings


class ExecutionHistoryService:
    """Service for managing execution history and cleanup"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def cleanup_expired_executions(self, days: int = 30) -> Dict[str, int]:
        """Clean up executions older than specified days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get count of executions to be deleted
        result = await self.db.execute(
            select(func.count(Execution.id))
            .where(Execution.created_at < cutoff_date)
        )
        execution_count = result.scalar()
        
        # Get count of execution nodes to be deleted
        result = await self.db.execute(
            select(func.count(ExecutionNode.id))
            .join(Execution, ExecutionNode.execution_id == Execution.id)
            .where(Execution.created_at < cutoff_date)
        )
        node_count = result.scalar()
        
        # Delete execution nodes first (due to foreign key constraints)
        await self.db.execute(
            delete(ExecutionNode)
            .where(
                ExecutionNode.execution_id.in_(
                    select(Execution.id).where(Execution.created_at < cutoff_date)
                )
            )
        )
        
        # Delete executions
        await self.db.execute(
            delete(Execution).where(Execution.created_at < cutoff_date)
        )
        
        await self.db.commit()
        
        return {
            "executions_deleted": execution_count,
            "nodes_deleted": node_count,
            "cutoff_date": cutoff_date.isoformat()
        }

    async def get_execution_statistics(self, user_id: UUID, days: int = 30) -> Dict[str, Any]:
        """Get execution statistics for a user"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Total executions
        result = await self.db.execute(
            select(func.count(Execution.id))
            .where(
                Execution.user_id == user_id,
                Execution.created_at >= cutoff_date
            )
        )
        total_executions = result.scalar()
        
        # Successful executions
        result = await self.db.execute(
            select(func.count(Execution.id))
            .where(
                Execution.user_id == user_id,
                Execution.status == "completed",
                Execution.created_at >= cutoff_date
            )
        )
        successful_executions = result.scalar()
        
        # Failed executions
        result = await self.db.execute(
            select(func.count(Execution.id))
            .where(
                Execution.user_id == user_id,
                Execution.status == "failed",
                Execution.created_at >= cutoff_date
            )
        )
        failed_executions = result.scalar()
        
        # Total tokens used
        result = await self.db.execute(
            select(func.coalesce(func.sum(Execution.tokens_used), 0))
            .where(
                Execution.user_id == user_id,
                Execution.created_at >= cutoff_date
            )
        )
        total_tokens = result.scalar()
        
        # Total cost
        result = await self.db.execute(
            select(func.coalesce(func.sum(Execution.cost_cents), 0))
            .where(
                Execution.user_id == user_id,
                Execution.created_at >= cutoff_date
            )
        )
        total_cost_cents = result.scalar()
        
        # Average execution time
        result = await self.db.execute(
            select(
                func.avg(
                    func.extract('epoch', Execution.completed_at - Execution.started_at)
                )
            )
            .where(
                Execution.user_id == user_id,
                Execution.status == "completed",
                Execution.started_at.isnot(None),
                Execution.completed_at.isnot(None),
                Execution.created_at >= cutoff_date
            )
        )
        avg_execution_time = result.scalar()
        
        return {
            "period_days": days,
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "failed_executions": failed_executions,
            "success_rate": (successful_executions / total_executions * 100) if total_executions > 0 else 0,
            "total_tokens": total_tokens,
            "total_cost_cents": total_cost_cents,
            "total_cost_dollars": total_cost_cents / 100,
            "avg_execution_time_seconds": avg_execution_time,
            "avg_execution_time_formatted": f"{avg_execution_time:.1f}s" if avg_execution_time else None
        }

    async def get_agent_performance_metrics(self, flow_id: UUID, days: int = 30) -> Dict[str, Any]:
        """Get performance metrics for a specific agent flow"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Execution count and success rate
        result = await self.db.execute(
            select(
                func.count(Execution.id).label("total_executions"),
                func.sum(
                    func.case(
                        (Execution.status == "completed", 1),
                        else_=0
                    )
                ).label("successful_executions")
            )
            .where(
                Execution.flow_id == flow_id,
                Execution.created_at >= cutoff_date
            )
        )
        stats = result.first()
        
        total_executions = stats.total_executions or 0
        successful_executions = stats.successful_executions or 0
        
        # Average execution time
        result = await self.db.execute(
            select(
                func.avg(
                    func.extract('epoch', Execution.completed_at - Execution.started_at)
                )
            )
            .where(
                Execution.flow_id == flow_id,
                Execution.status == "completed",
                Execution.started_at.isnot(None),
                Execution.completed_at.isnot(None),
                Execution.created_at >= cutoff_date
            )
        )
        avg_execution_time = result.scalar()
        
        # Node-level statistics
        result = await self.db.execute(
            select(
                ExecutionNode.node_type,
                func.count(ExecutionNode.id).label("execution_count"),
                func.avg(ExecutionNode.duration_ms).label("avg_duration_ms")
            )
            .join(Execution, ExecutionNode.execution_id == Execution.id)
            .where(
                Execution.flow_id == flow_id,
                Execution.created_at >= cutoff_date
            )
            .group_by(ExecutionNode.node_type)
        )
        node_stats = result.fetchall()
        
        return {
            "flow_id": str(flow_id),
            "period_days": days,
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "failed_executions": total_executions - successful_executions,
            "success_rate": (successful_executions / total_executions * 100) if total_executions > 0 else 0,
            "avg_execution_time_seconds": avg_execution_time,
            "avg_execution_time_formatted": f"{avg_execution_time:.1f}s" if avg_execution_time else None,
            "node_performance": [
                {
                    "node_type": stat.node_type,
                    "execution_count": stat.execution_count,
                    "avg_duration_ms": stat.avg_duration_ms,
                    "avg_duration_formatted": f"{stat.avg_duration_ms:.0f}ms" if stat.avg_duration_ms else None
                }
                for stat in node_stats
            ]
        }

    async def schedule_cleanup_task(self, days: int = 30):
        """Schedule a background cleanup task"""
        async def cleanup_task():
            while True:
                try:
                    await asyncio.sleep(24 * 60 * 60)  # Run daily
                    await self.cleanup_expired_executions(days)
                except Exception as e:
                    # Log error but continue running
                    print(f"Cleanup task error: {e}")
        
        # Start the cleanup task
        asyncio.create_task(cleanup_task())
