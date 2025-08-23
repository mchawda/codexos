# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Execution Timeline Service for CodexOS
Provides detailed step-by-step execution tracking and replay capabilities
"""

from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from datetime import datetime, timedelta
import json
import hashlib

from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.models.agent import Execution, ExecutionNode, ExecutionStep
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.execution import ExecutionStepCreate, ExecutionStepUpdate


class ExecutionTimelineService:
    """Service for managing execution timelines and replay capabilities"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_execution_step(
        self,
        execution_id: UUID,
        execution_node_id: UUID,
        step_data: ExecutionStepCreate,
        user: User
    ) -> ExecutionStep:
        """Create a new execution step with detailed tracking"""
        
        # Create the execution step
        execution_step = ExecutionStep(
            execution_id=execution_id,
            execution_node_id=execution_node_id,
            step_number=step_data.step_number,
            step_type=step_data.step_type,
            step_name=step_data.step_name,
            input_data=step_data.input_data,
            output_data=step_data.output_data,
            intermediate_data=step_data.intermediate_data,
            tool_name=step_data.tool_name,
            tool_parameters=step_data.tool_parameters,
            tool_result=step_data.tool_result,
            model_name=step_data.model_name,
            prompt_tokens=step_data.prompt_tokens,
            completion_tokens=step_data.completion_tokens,
            temperature=step_data.temperature,
            max_tokens=step_data.max_tokens,
            query=step_data.query,
            retrieved_documents=step_data.retrieved_documents,
            relevance_scores=step_data.relevance_scores,
            started_at=step_data.started_at or datetime.utcnow(),
            completed_at=step_data.completed_at,
            duration_ms=step_data.duration_ms,
            latency_ms=step_data.latency_ms,
            cost_cents=step_data.cost_cents,
            cost_breakdown=step_data.cost_breakdown,
            status=step_data.status,
            error_message=step_data.error_message,
            retry_count=step_data.retry_count,
            can_replay_from=step_data.can_replay_from,
            replay_dependencies=step_data.replay_dependencies,
            extra_data=step_data.extra_data,
            tags=step_data.tags
        )
        
        self.db.add(execution_step)
        self.db.commit()
        self.db.refresh(execution_step)
        
        return execution_step
    
    def get_execution_timeline(
        self,
        execution_id: UUID,
        include_steps: bool = True,
        include_nodes: bool = True
    ) -> Dict[str, Any]:
        """Get complete execution timeline with steps and nodes"""
        
        # Get the execution
        execution = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")
        
        timeline = {
            "execution_id": str(execution.id),
            "flow_id": str(execution.flow_id),
            "status": execution.status,
            "started_at": execution.started_at,
            "completed_at": execution.completed_at,
            "tokens_used": execution.tokens_used,
            "cost_cents": execution.cost_cents,
            "can_replay": execution.can_replay,
            "replay_count": execution.replay_count,
            "original_execution_id": str(execution.original_execution_id) if execution.original_execution_id else None
        }
        
        if include_nodes:
            # Get execution nodes
            nodes = self.db.query(ExecutionNode).filter(
                ExecutionNode.execution_id == execution_id
            ).order_by(ExecutionNode.started_at).all()
            
            timeline["nodes"] = []
            for node in nodes:
                node_data = {
                    "node_id": node.node_id,
                    "node_type": node.node_type,
                    "status": node.status,
                    "started_at": node.started_at,
                    "completed_at": node.completed_at,
                    "duration_ms": node.duration_ms,
                    "error_message": node.error_message
                }
                
                if include_steps:
                    # Get steps for this node
                    steps = self.db.query(ExecutionStep).filter(
                        ExecutionStep.execution_node_id == node.id
                    ).order_by(ExecutionStep.step_number).all()
                    
                    node_data["steps"] = []
                    for step in steps:
                        step_data = {
                            "step_number": step.step_number,
                            "step_type": step.step_type,
                            "step_name": step.step_name,
                            "status": step.status,
                            "started_at": step.started_at,
                            "completed_at": step.completed_at,
                            "duration_ms": step.duration_ms,
                            "cost_cents": step.cost_cents,
                            "can_replay_from": step.can_replay_from,
                            "error_message": step.error_message
                        }
                        
                        # Add tool-specific data
                        if step.tool_name:
                            step_data["tool"] = {
                                "name": step.tool_name,
                                "parameters": step.tool_parameters,
                                "result": step.tool_result
                            }
                        
                        # Add LLM-specific data
                        if step.model_name:
                            step_data["llm"] = {
                                "model": step.model_name,
                                "prompt_tokens": step.prompt_tokens,
                                "completion_tokens": step.completion_tokens,
                                "temperature": step.temperature,
                                "max_tokens": step.max_tokens
                            }
                        
                        # Add RAG-specific data
                        if step.query:
                            step_data["rag"] = {
                                "query": step.query,
                                "retrieved_documents": step.retrieved_documents,
                                "relevance_scores": step.relevance_scores
                            }
                        
                        node_data["steps"].append(step_data)
                
                timeline["nodes"].append(node_data)
        
        return timeline
    
    def replay_execution_from_step(
        self,
        execution_id: UUID,
        step_number: int,
        user: User,
        new_input_data: Optional[Dict[str, Any]] = None
    ) -> Execution:
        """Replay execution from a specific step with optional new input"""
        
        # Get the original execution
        original_execution = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if not original_execution:
            raise ValueError(f"Execution {execution_id} not found")
        
        if not original_execution.can_replay:
            raise ValueError("This execution cannot be replayed")
        
        # Get the step to replay from
        step = self.db.query(ExecutionStep).filter(
            and_(
                ExecutionStep.execution_id == execution_id,
                ExecutionStep.step_number == step_number
            )
        ).first()
        
        if not step:
            raise ValueError(f"Step {step_number} not found in execution {execution_id}")
        
        if not step.can_replay_from:
            raise ValueError(f"Step {step_number} cannot be replayed from")
        
        # Create new execution
        new_execution = Execution(
            tenant_id=original_execution.tenant_id,
            flow_id=original_execution.flow_id,
            user_id=user.id,
            status="pending",
            input_data=new_input_data or original_execution.input_data,
            can_replay=True,
            replay_count=original_execution.replay_count + 1,
            original_execution_id=execution_id
        )
        
        self.db.add(new_execution)
        self.db.commit()
        self.db.refresh(new_execution)
        
        # Copy execution steps from the replay point
        steps_to_copy = self.db.query(ExecutionStep).filter(
            and_(
                ExecutionStep.execution_id == execution_id,
                ExecutionStep.step_number >= step_number
            )
        ).order_by(ExecutionStep.step_number).all()
        
        for i, original_step in enumerate(steps_to_copy):
            new_step = ExecutionStep(
                execution_id=new_execution.id,
                execution_node_id=original_step.execution_node_id,
                step_number=i + 1,  # Reset step numbering
                step_type=original_step.step_type,
                step_name=original_step.step_name,
                input_data=original_step.input_data,
                output_data=None,  # Reset output for replay
                intermediate_data=original_step.intermediate_data,
                tool_name=original_step.tool_name,
                tool_parameters=original_step.tool_parameters,
                tool_result=None,  # Reset result for replay
                model_name=original_step.model_name,
                prompt_tokens=0,  # Reset for replay
                completion_tokens=0,  # Reset for replay
                temperature=original_step.temperature,
                max_tokens=original_step.max_tokens,
                query=original_step.query,
                retrieved_documents=None,  # Reset for replay
                relevance_scores=None,  # Reset for replay
                started_at=None,  # Will be set when step starts
                completed_at=None,  # Will be set when step completes
                duration_ms=None,
                latency_ms=None,
                cost_cents=0,  # Reset for replay
                cost_breakdown=None,
                status="pending",  # Reset status for replay
                error_message=None,
                retry_count=0,
                can_replay_from=original_step.can_replay_from,
                replay_dependencies=original_step.replay_dependencies,
                extra_data=original_step.extra_data,
                tags=original_step.tags
            )
            
            self.db.add(new_step)
        
        self.db.commit()
        
        return new_execution
    
    def get_replay_candidates(
        self,
        execution_id: UUID
    ) -> List[Dict[str, Any]]:
        """Get list of steps that can be replayed from"""
        
        steps = self.db.query(ExecutionStep).filter(
            and_(
                ExecutionStep.execution_id == execution_id,
                ExecutionStep.can_replay_from == True
            )
        ).order_by(ExecutionStep.step_number).all()
        
        candidates = []
        for step in steps:
            candidate = {
                "step_number": step.step_number,
                "step_name": step.step_name,
                "step_type": step.step_type,
                "description": f"Replay from {step.step_name}",
                "dependencies": step.replay_dependencies or [],
                "estimated_cost": step.cost_cents or 0
            }
            candidates.append(candidate)
        
        return candidates
    
    def update_step_status(
        self,
        step_id: UUID,
        status: str,
        output_data: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        cost_cents: Optional[int] = None
    ) -> ExecutionStep:
        """Update execution step status and results"""
        
        step = self.db.query(ExecutionStep).filter(ExecutionStep.id == step_id).first()
        if not step:
            raise ValueError(f"Step {step_id} not found")
        
        step.status = status
        step.completed_at = datetime.utcnow()
        
        if output_data is not None:
            step.output_data = output_data
        
        if error_message is not None:
            step.error_message = error_message
        
        if cost_cents is not None:
            step.cost_cents = cost_cents
        
        # Calculate duration if started_at is set
        if step.started_at and step.completed_at:
            step.duration_ms = int((step.completed_at - step.started_at).total_seconds() * 1000)
        
        self.db.commit()
        self.db.refresh(step)
        
        return step
    
    def get_execution_cost_breakdown(
        self,
        execution_id: UUID
    ) -> Dict[str, Any]:
        """Get detailed cost breakdown for an execution"""
        
        steps = self.db.query(ExecutionStep).filter(
            ExecutionStep.execution_id == execution_id
        ).all()
        
        total_cost = 0
        cost_by_type = {}
        cost_by_tool = {}
        cost_by_model = {}
        
        for step in steps:
            step_cost = step.cost_cents or 0
            total_cost += step_cost
            
            # Cost by step type
            if step.step_type not in cost_by_type:
                cost_by_type[step.step_type] = 0
            cost_by_type[step.step_type] += step_cost
            
            # Cost by tool
            if step.tool_name:
                if step.tool_name not in cost_by_tool:
                    cost_by_tool[step.tool_name] = 0
                cost_by_tool[step.tool_name] += step_cost
            
            # Cost by model
            if step.model_name:
                if step.model_name not in cost_by_model:
                    cost_by_model[step.model_name] = 0
                cost_by_model[step.model_name] += step_cost
        
        return {
            "total_cost_cents": total_cost,
            "cost_by_type": cost_by_type,
            "cost_by_tool": cost_by_tool,
            "cost_by_model": cost_by_model,
            "step_count": len(steps)
        }
    
    def cleanup_old_executions(
        self,
        days_to_keep: int = 30
    ) -> int:
        """Clean up old execution data based on TTL"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
        
        # Delete old execution steps first (due to foreign key constraints)
        deleted_steps = self.db.query(ExecutionStep).filter(
            ExecutionStep.created_at < cutoff_date
        ).delete()
        
        # Delete old execution nodes
        deleted_nodes = self.db.query(ExecutionNode).filter(
            ExecutionNode.created_at < cutoff_date
        ).delete()
        
        # Delete old executions
        deleted_executions = self.db.query(Execution).filter(
            Execution.created_at < cutoff_date
        ).delete()
        
        self.db.commit()
        
        return deleted_executions
