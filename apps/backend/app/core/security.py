# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Security utilities and guardrails for CodexOS
"""

import os
import time
import resource
import subprocess
import tempfile
import shutil
import signal
from typing import Dict, List, Optional, Set, Tuple, Any
from dataclasses import dataclass
from pathlib import Path
import logging
import asyncio
from contextlib import asynccontextmanager
import psutil
import docker
from docker.errors import DockerException

logger = logging.getLogger(__name__)


@dataclass
class ToolPermission:
    """Tool permission configuration"""
    name: str
    allowed: bool
    cpu_limit: float  # CPU time limit in seconds
    memory_limit: int  # Memory limit in MB
    fs_paths: List[str]  # Allowed filesystem paths
    net_egress: List[str]  # Allowed network destinations
    timeout: int  # Execution timeout in seconds
    max_concurrent: int  # Maximum concurrent executions


@dataclass
class ResourceQuota:
    """Resource quota for agent execution"""
    cpu_time: float
    memory_mb: int
    disk_mb: int
    network_mb: int
    max_processes: int


class SecurityGuardrails:
    """Main security guardrails system"""
    
    def __init__(self):
        self.tool_permissions: Dict[str, ToolPermission] = self._load_default_permissions()
        self.active_executions: Dict[str, Dict[str, Any]] = {}
        self.resource_monitor = ResourceMonitor()
        
    def _load_default_permissions(self) -> Dict[str, ToolPermission]:
        """Load default tool permissions"""
        return {
            "fs_read": ToolPermission(
                name="fs_read",
                allowed=True,
                cpu_limit=30.0,
                memory_limit=512,
                fs_paths=["/tmp", "/var/tmp", "/home/codexos"],
                net_egress=[],
                timeout=60,
                max_concurrent=5
            ),
            "fs_write": ToolPermission(
                name="fs_write",
                allowed=True,
                cpu_limit=60.0,
                memory_limit=1024,
                fs_paths=["/tmp", "/var/tmp"],
                net_egress=[],
                timeout=120,
                max_concurrent=3
            ),
            "web_request": ToolPermission(
                name="web_request",
                allowed=True,
                cpu_limit=30.0,
                memory_limit=256,
                fs_paths=[],
                net_egress=["https://api.openai.com", "https://api.anthropic.com"],
                timeout=60,
                max_concurrent=10
            ),
            "code_execution": ToolPermission(
                name="code_execution",
                allowed=False,  # Disabled by default
                cpu_limit=300.0,
                memory_limit=2048,
                fs_paths=["/tmp/codexos-sandbox"],
                net_egress=[],
                timeout=300,
                max_concurrent=1
            ),
            "shell_command": ToolPermission(
                name="shell_command",
                allowed=False,  # Disabled by default
                cpu_limit=60.0,
                memory_limit=512,
                fs_paths=["/tmp/codexos-sandbox"],
                net_egress=[],
                timeout=120,
                max_concurrent=1
            )
        }
    
    def check_tool_permission(self, tool_name: str, user_id: str) -> bool:
        """Check if user can execute a tool"""
        if tool_name not in self.tool_permissions:
            logger.warning(f"Unknown tool requested: {tool_name}")
            return False
            
        permission = self.tool_permissions[tool_name]
        if not permission.allowed:
            logger.warning(f"Tool {tool_name} is disabled")
            return False
            
        # Check concurrent execution limits
        active_count = len([
            exec_id for exec_id, exec_data in self.active_executions.items()
            if exec_data.get("tool") == tool_name and exec_data.get("user_id") == user_id
        ])
        
        if active_count >= permission.max_concurrent:
            logger.warning(f"Tool {tool_name} concurrent limit reached for user {user_id}")
            return False
            
        return True
    
    def create_execution_context(self, tool_name: str, user_id: str, execution_id: str) -> Dict[str, Any]:
        """Create secure execution context"""
        permission = self.tool_permissions[tool_name]
        
        # Create temporary sandbox directory
        sandbox_dir = tempfile.mkdtemp(prefix=f"codexos-{execution_id}-")
        
        # Set resource limits
        context = {
            "execution_id": execution_id,
            "user_id": user_id,
            "tool": tool_name,
            "sandbox_dir": sandbox_dir,
            "start_time": time.time(),
            "resource_limits": {
                "cpu_time": permission.cpu_limit,
                "memory_mb": permission.memory_limit,
                "timeout": permission.timeout
            },
            "fs_paths": permission.fs_paths.copy(),
            "net_egress": permission.net_egress.copy()
        }
        
        self.active_executions[execution_id] = context
        return context
    
    def cleanup_execution(self, execution_id: str):
        """Clean up execution context"""
        if execution_id in self.active_executions:
            context = self.active_executions[execution_id]
            
            # Clean up sandbox directory
            if os.path.exists(context["sandbox_dir"]):
                shutil.rmtree(context["sandbox_dir"])
            
            # Remove from active executions
            del self.active_executions[execution_id]


class ResourceMonitor:
    """Monitor and enforce resource limits"""
    
    def __init__(self):
        self.process_monitors: Dict[str, psutil.Process] = {}
        
    def start_monitoring(self, execution_id: str, process: subprocess.Popen):
        """Start monitoring a process"""
        try:
            psutil_process = psutil.Process(process.pid)
            self.process_monitors[execution_id] = psutil_process
        except psutil.NoSuchProcess:
            logger.warning(f"Process {process.pid} not found for monitoring")
    
    def check_limits(self, execution_id: str, context: Dict[str, Any]) -> bool:
        """Check if process is within resource limits"""
        if execution_id not in self.process_monitors:
            return True
            
        process = self.process_monitors[execution_id]
        limits = context["resource_limits"]
        
        try:
            # Check CPU time
            cpu_times = process.cpu_times()
            total_cpu = cpu_times.user + cpu_times.system
            if total_cpu > limits["cpu_time"]:
                logger.warning(f"CPU limit exceeded for {execution_id}")
                return False
            
            # Check memory usage
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024
            if memory_mb > limits["memory_mb"]:
                logger.warning(f"Memory limit exceeded for {execution_id}")
                return False
                
            return True
            
        except psutil.NoSuchProcess:
            # Process finished
            return True
    
    def stop_monitoring(self, execution_id: str):
        """Stop monitoring a process"""
        if execution_id in self.process_monitors:
            del self.process_monitors[execution_id]


class ExecutionSandbox:
    """Secure execution sandbox for agents"""
    
    def __init__(self, base_dir: str = "/tmp/codexos-sandbox"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)
        
    def create_sandbox(self, execution_id: str) -> Path:
        """Create isolated sandbox for execution"""
        sandbox_path = self.base_dir / execution_id
        sandbox_path.mkdir(exist_ok=True)
        
        # Set restrictive permissions
        os.chmod(sandbox_path, 0o700)
        
        return sandbox_path
    
    def run_sandboxed_process(
        self,
        command: List[str],
        execution_id: str,
        context: Dict[str, Any],
        timeout: int = 30
    ) -> subprocess.CompletedProcess:
        """Run process in sandboxed environment"""
        sandbox_path = self.create_sandbox(execution_id)
        
        # Create seccomp profile for additional security
        seccomp_profile = self._create_seccomp_profile(context)
        
        try:
            # Run with resource limits
            process = subprocess.run(
                command,
                cwd=sandbox_path,
                capture_output=True,
                text=True,
                timeout=timeout,
                preexec_fn=self._set_resource_limits(context)
            )
            return process
            
        except subprocess.TimeoutExpired:
            # Kill any remaining processes
            self._cleanup_processes(execution_id)
            raise
    
    def _set_resource_limits(self, context: Dict[str, Any]):
        """Set resource limits for subprocess"""
        def limit_resources():
            limits = context["resource_limits"]
            
            # Set CPU time limit
            resource.setrlimit(resource.RLIMIT_CPU, (limits["cpu_time"], limits["cpu_time"]))
            
            # Set memory limit
            memory_bytes = limits["memory_mb"] * 1024 * 1024
            resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
            
            # Set file descriptor limit
            resource.setrlimit(resource.RLIMIT_NOFILE, (100, 100))
            
            # Set process limit
            resource.setrlimit(resource.RLIMIT_NPROC, (10, 10))
        
        return limit_resources
    
    def _create_seccomp_profile(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Create seccomp profile for process isolation"""
        # Basic seccomp profile - allow only essential syscalls
        return {
            "defaultAction": "SCMP_ACT_ERRNO",
            "syscalls": [
                {
                    "names": ["read", "write", "exit", "exit_group", "rt_sigreturn"],
                    "action": "SCMP_ACT_ALLOW"
                }
            ]
        }
    
    def _cleanup_processes(self, execution_id: str):
        """Clean up any remaining processes"""
        try:
            # Find and kill processes in sandbox
            sandbox_path = self.base_dir / execution_id
            if sandbox_path.exists():
                for proc in psutil.process_iter(['pid', 'cwd']):
                    try:
                        if str(proc.info['cwd']).startswith(str(sandbox_path)):
                            proc.terminate()
                            proc.wait(timeout=5)
                    except (psutil.NoSuchProcess, psutil.TimeoutExpired):
                        pass
        except Exception as e:
            logger.error(f"Error cleaning up processes: {e}")


class MemoryTierManager:
    """Manage different memory tiers with retention policies"""
    
    def __init__(self):
        self.ephemeral: Dict[str, Any] = {}  # Per-task memory
        self.session: Dict[str, Any] = {}    # Per-user memory
        self.semantic: Dict[str, Any] = {}   # Vector store memory
        
        # Retention windows (in seconds)
        self.retention_windows = {
            "ephemeral": 3600,    # 1 hour
            "session": 86400,     # 24 hours
            "semantic": 2592000   # 30 days
        }
        
        # Start cleanup scheduler
        asyncio.create_task(self._cleanup_scheduler())
    
    async def store_ephemeral(self, task_id: str, key: str, value: Any):
        """Store data in ephemeral memory tier"""
        self.ephemeral[f"{task_id}:{key}"] = {
            "value": value,
            "timestamp": time.time(),
            "tier": "ephemeral"
        }
    
    async def store_session(self, user_id: str, key: str, value: Any):
        """Store data in session memory tier"""
        self.session[f"{user_id}:{key}"] = {
            "value": value,
            "timestamp": time.time(),
            "tier": "session"
        }
    
    async def store_semantic(self, key: str, value: Any, metadata: Dict[str, Any] = None):
        """Store data in semantic memory tier"""
        self.semantic[key] = {
            "value": value,
            "metadata": metadata or {},
            "timestamp": time.time(),
            "tier": "semantic"
        }
    
    async def retrieve(self, tier: str, key: str) -> Optional[Any]:
        """Retrieve data from specified memory tier"""
        if tier == "ephemeral":
            return self.ephemeral.get(key, {}).get("value")
        elif tier == "session":
            return self.session.get(key, {}).get("value")
        elif tier == "semantic":
            return self.semantic.get(key, {}).get("value")
        return None
    
    async def _cleanup_scheduler(self):
        """Periodically clean up expired memory entries"""
        while True:
            await asyncio.sleep(300)  # Run every 5 minutes
            
            current_time = time.time()
            
            # Clean up ephemeral memory
            expired_ephemeral = [
                k for k, v in self.ephemeral.items()
                if current_time - v["timestamp"] > self.retention_windows["ephemeral"]
            ]
            for k in expired_ephemeral:
                del self.ephemeral[k]
            
            # Clean up session memory
            expired_session = [
                k for k, v in self.session.items()
                if current_time - v["timestamp"] > self.retention_windows["session"]
            ]
            for k in expired_session:
                del self.session[k]
            
            # Clean up semantic memory (keep longer, but log usage)
            if len(self.semantic) > 10000:  # Limit semantic memory size
                # Remove oldest entries
                sorted_items = sorted(
                    self.semantic.items(),
                    key=lambda x: x[1]["timestamp"]
                )
                items_to_remove = sorted_items[:1000]  # Remove oldest 1000
                for k, _ in items_to_remove:
                    del self.semantic[k]
            
            logger.debug(f"Memory cleanup: ephemeral={len(expired_ephemeral)}, session={len(expired_session)}")


class InterruptionManager:
    """Manage execution interruption and rollback"""
    
    def __init__(self):
        self.interruption_hooks: Dict[str, callable] = {}
        self.rollback_hooks: Dict[str, callable] = {}
        
    def register_interruption_hook(self, execution_id: str, hook: callable):
        """Register hook to run when execution is interrupted"""
        self.interruption_hooks[execution_id] = hook
    
    def register_rollback_hook(self, execution_id: str, hook: callable):
        """Register hook to run for rollback"""
        self.rollback_hooks[execution_id] = hook
    
    async def interrupt_execution(self, execution_id: str, reason: str = "User request"):
        """Interrupt running execution"""
        if execution_id in self.interruption_hooks:
            try:
                await self.interruption_hooks[execution_id](reason)
                logger.info(f"Execution {execution_id} interrupted: {reason}")
            except Exception as e:
                logger.error(f"Error in interruption hook: {e}")
    
    async def rollback_execution(self, execution_id: str, checkpoint: str = "latest"):
        """Rollback execution to checkpoint"""
        if execution_id in self.rollback_hooks:
            try:
                await self.rollback_hooks[execution_id](checkpoint)
                logger.info(f"Execution {execution_id} rolled back to {checkpoint}")
            except Exception as e:
                logger.error(f"Error in rollback hook: {e}")


# Global instances
security_guardrails = SecurityGuardrails()
resource_monitor = ResourceMonitor()
execution_sandbox = ExecutionSandbox()
memory_tier_manager = MemoryTierManager()
interruption_manager = InterruptionManager()
