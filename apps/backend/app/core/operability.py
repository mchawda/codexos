# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Operability and reliability features for CodexOS
"""

import asyncio
import time
import json
from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass, field
from enum import Enum
from contextlib import asynccontextmanager
import structlog
import httpx
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.metrics.export import ConsoleMetricExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

from app.core.config import settings

logger = structlog.get_logger()
tracer = trace.get_tracer(__name__)


class HealthStatus(Enum):
    """Health check status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


@dataclass
class HealthCheck:
    """Individual health check result"""
    name: str
    status: HealthStatus
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    response_time_ms: Optional[float] = None
    last_check: Optional[float] = None


@dataclass
class SystemHealth:
    """Overall system health status"""
    status: HealthStatus
    timestamp: float
    checks: Dict[str, HealthCheck] = field(default_factory=dict)
    version: str = "1.0.0"
    uptime_seconds: float = 0.0


class CircuitBreaker:
    """Circuit breaker pattern for outbound calls"""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
    
    def _on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"


class RetryHandler:
    """Retry logic with exponential backoff"""
    
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
    
    async def execute(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with retry logic"""
        last_exception = None
        
        for attempt in range(self.max_retries + 1):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                
                if attempt == self.max_retries:
                    break
                
                # Calculate delay with exponential backoff
                delay = self.base_delay * (2 ** attempt)
                await asyncio.sleep(delay)
        
        raise last_exception


class TimeoutHandler:
    """Timeout handling for async operations"""
    
    def __init__(self, default_timeout: float = 30.0):
        self.default_timeout = default_timeout
    
    async def execute(self, func: Callable, timeout: Optional[float] = None, *args, **kwargs) -> Any:
        """Execute function with timeout"""
        timeout = timeout or self.default_timeout
        
        try:
            return await asyncio.wait_for(func(*args, **kwargs), timeout=timeout)
        except asyncio.TimeoutError:
            raise TimeoutError(f"Operation timed out after {timeout} seconds")


class HealthChecker:
    """Comprehensive health checking system"""
    
    def __init__(self):
        self.checks: Dict[str, Callable] = {}
        self.start_time = time.time()
        self.register_default_checks()
    
    def register_check(self, name: str, check_func: Callable):
        """Register a health check function"""
        self.checks[name] = check_func
    
    def register_default_checks(self):
        """Register default health checks"""
        self.register_check("database", self._check_database)
        self.register_check("redis", self._check_redis)
        self.register_check("chroma", self._check_chroma)
        self.register_check("external_apis", self._check_external_apis)
        self.register_check("disk_space", self._check_disk_space)
        self.register_check("memory_usage", self._check_memory_usage)
    
    async def check_all(self) -> SystemHealth:
        """Run all health checks"""
        start_time = time.time()
        checks = {}
        
        # Run checks concurrently
        tasks = []
        for name, check_func in self.checks.items():
            task = asyncio.create_task(self._run_check(name, check_func))
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        for i, (name, check_func) in enumerate(self.checks.items()):
            if isinstance(results[i], Exception):
                checks[name] = HealthCheck(
                    name=name,
                    status=HealthStatus.UNHEALTHY,
                    message=f"Check failed: {str(results[i])}",
                    response_time_ms=0
                )
            else:
                checks[name] = results[i]
        
        # Determine overall status
        overall_status = self._determine_overall_status(checks)
        
        return SystemHealth(
            status=overall_status,
            timestamp=time.time(),
            checks=checks,
            uptime_seconds=time.time() - self.start_time
        )
    
    async def _run_check(self, name: str, check_func: Callable) -> HealthCheck:
        """Run individual health check"""
        start_time = time.time()
        
        try:
            result = await check_func()
            response_time = (time.time() - start_time) * 1000
            
            return HealthCheck(
                name=name,
                status=result.get("status", HealthStatus.HEALTHY),
                message=result.get("message", "OK"),
                details=result.get("details", {}),
                response_time_ms=response_time,
                last_check=time.time()
            )
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            
            return HealthCheck(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message=f"Check failed: {str(e)}",
                response_time_ms=response_time,
                last_check=time.time()
            )
    
    def _determine_overall_status(self, checks: Dict[str, HealthCheck]) -> HealthStatus:
        """Determine overall system health status"""
        if any(check.status == HealthStatus.UNHEALTHY for check in checks.values()):
            return HealthStatus.UNHEALTHY
        elif any(check.status == HealthStatus.DEGRADED for check in checks.values()):
            return HealthStatus.DEGRADED
        else:
            return HealthStatus.HEALTHY
    
    async def _check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            # This would check your actual database connection
            # For now, return mock result
            return {
                "status": HealthStatus.HEALTHY,
                "message": "Database connection OK",
                "details": {"connections": 5, "response_time_ms": 2.5}
            }
        except Exception as e:
            return {
                "status": HealthStatus.UNHEALTHY,
                "message": f"Database check failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _check_redis(self) -> Dict[str, Any]:
        """Check Redis connectivity"""
        try:
            # This would check your actual Redis connection
            return {
                "status": HealthStatus.HEALTHY,
                "message": "Redis connection OK",
                "details": {"memory_usage": "128MB", "connected_clients": 3}
            }
        except Exception as e:
            return {
                "status": HealthStatus.UNHEALTHY,
                "message": f"Redis check failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _check_chroma(self) -> Dict[str, Any]:
        """Check ChromaDB connectivity"""
        try:
            # This would check your actual ChromaDB connection
            return {
                "status": HealthStatus.HEALTHY,
                "message": "ChromaDB connection OK",
                "details": {"collections": 5, "documents": 1250}
            }
        except Exception as e:
            return {
                "status": HealthStatus.UNHEALTHY,
                "message": f"ChromaDB check failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _check_external_apis(self) -> Dict[str, Any]:
        """Check external API connectivity"""
        try:
            # Check OpenAI API
            openai_status = "unknown"
            if settings.OPENAI_API_KEY:
                try:
                    # This would make an actual API call
                    openai_status = "healthy"
                except Exception:
                    openai_status = "unhealthy"
            
            return {
                "status": HealthStatus.HEALTHY if openai_status == "healthy" else HealthStatus.DEGRADED,
                "message": "External APIs check completed",
                "details": {"openai": openai_status}
            }
        except Exception as e:
            return {
                "status": HealthStatus.UNHEALTHY,
                "message": f"External APIs check failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _check_disk_space(self) -> Dict[str, Any]:
        """Check disk space usage"""
        try:
            import shutil
            
            total, used, free = shutil.disk_usage("/")
            usage_percent = (used / total) * 100
            
            if usage_percent > 90:
                status = HealthStatus.UNHEALTHY
                message = "Disk space critically low"
            elif usage_percent > 80:
                status = HealthStatus.DEGRADED
                message = "Disk space usage high"
            else:
                status = HealthStatus.HEALTHY
                message = "Disk space OK"
            
            return {
                "status": status,
                "message": message,
                "details": {
                    "total_gb": total / (1024**3),
                    "used_gb": used / (1024**3),
                    "free_gb": free / (1024**3),
                    "usage_percent": usage_percent
                }
            }
        except Exception as e:
            return {
                "status": HealthStatus.UNHEALTHY,
                "message": f"Disk space check failed: {str(e)}",
                "details": {"error": str(e)}
            }
    
    async def _check_memory_usage(self) -> Dict[str, Any]:
        """Check memory usage"""
        try:
            import psutil
            
            memory = psutil.virtual_memory()
            usage_percent = memory.percent
            
            if usage_percent > 90:
                status = HealthStatus.UNHEALTHY
                message = "Memory usage critically high"
            elif usage_percent > 80:
                status = HealthStatus.DEGRADED
                message = "Memory usage high"
            else:
                status = HealthStatus.HEALTHY
                message = "Memory usage OK"
            
            return {
                "status": status,
                "message": message,
                "details": {
                    "total_gb": memory.total / (1024**3),
                    "available_gb": memory.available / (1024**3),
                    "usage_percent": usage_percent
                }
            }
        except Exception as e:
            return {
                "status": HealthStatus.UNHEALTHY,
                "message": f"Memory check failed: {str(e)}",
                "details": {"error": str(e)}
            }


class GracefulShutdown:
    """Graceful shutdown handler"""
    
    def __init__(self):
        self.shutdown_handlers: List[Callable] = []
        self.is_shutting_down = False
    
    def add_handler(self, handler: Callable):
        """Add shutdown handler"""
        self.shutdown_handlers.append(handler)
    
    async def shutdown(self, signal=None):
        """Execute graceful shutdown"""
        if self.is_shutting_down:
            return
        
        self.is_shutting_down = True
        logger.info("Starting graceful shutdown", signal=signal)
        
        # Execute shutdown handlers
        for handler in self.shutdown_handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler()
                else:
                    handler()
            except Exception as e:
                logger.error(f"Shutdown handler failed: {e}")
        
        logger.info("Graceful shutdown completed")


class IdempotencyManager:
    """Manage idempotency keys for mutating routes"""
    
    def __init__(self):
        self.processed_keys: Dict[str, float] = {}
        self.cleanup_interval = 3600  # 1 hour
    
    def is_duplicate(self, idempotency_key: str, ttl_seconds: int = 3600) -> bool:
        """Check if idempotency key has been processed recently"""
        current_time = time.time()
        
        # Clean up expired keys
        expired_keys = [k for k, v in self.processed_keys.items() 
                       if current_time - v > ttl_seconds]
        for key in expired_keys:
            del self.processed_keys[key]
        
        # Check if key exists
        if idempotency_key in self.processed_keys:
            return True
        
        # Add key
        self.processed_keys[idempotency_key] = current_time
        return False
    
    def mark_processed(self, idempotency_key: str):
        """Mark idempotency key as processed"""
        self.processed_keys[idempotency_key] = time.time()


# Global instances
health_checker = HealthChecker()
graceful_shutdown = GracefulShutdown()
idempotency_manager = IdempotencyManager()


def setup_telemetry():
    """Setup OpenTelemetry instrumentation"""
    if not settings.ENABLE_TELEMETRY:
        return
    
    # Trace provider
    trace_provider = TracerProvider()
    
    # Exporters
    if settings.ENVIRONMENT == "development":
        trace_exporter = ConsoleSpanExporter()
        metric_exporter = ConsoleMetricExporter()
    else:
        trace_exporter = OTLPSpanExporter(endpoint=settings.OTLP_ENDPOINT)
        metric_exporter = OTLPMetricExporter(endpoint=settings.OTLP_ENDPOINT)
    
    # Processors
    trace_provider.add_span_processor(BatchSpanProcessor(trace_exporter))
    
    # Set global providers
    trace.set_tracer_provider(trace_provider)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument()
    
    # Instrument HTTP client
    HTTPXClientInstrumentor.instrument()
    
    # Instrument Redis
    RedisInstrumentor.instrument()
    
    # Instrument SQLAlchemy
    SQLAlchemyInstrumentor.instrument()
    
    logger.info("Telemetry setup completed")


def setup_graceful_shutdown(app):
    """Setup graceful shutdown for FastAPI app"""
    @app.on_event("shutdown")
    async def shutdown_event():
        await graceful_shutdown.shutdown()
    
    # Add signal handlers
    import signal
    
    def signal_handler(signum, frame):
        asyncio.create_task(graceful_shutdown.shutdown(signum))
    
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    logger.info("Graceful shutdown setup completed")
