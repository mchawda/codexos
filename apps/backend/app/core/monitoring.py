"""
Monitoring and observability setup for production
"""

import time
import logging
from typing import Optional, Dict, Any
from contextlib import contextmanager

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

logger = logging.getLogger(__name__)

# Prometheus metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

active_users = Gauge(
    'active_users',
    'Number of active users'
)

agent_executions_total = Counter(
    'agent_executions_total',
    'Total agent executions',
    ['agent_type', 'status']
)

rag_queries_total = Counter(
    'rag_queries_total',
    'Total RAG queries',
    ['status']
)

marketplace_transactions_total = Counter(
    'marketplace_transactions_total',
    'Total marketplace transactions',
    ['type', 'status']
)

database_connections = Gauge(
    'database_connections',
    'Number of active database connections'
)

cache_hits = Counter(
    'cache_hits_total',
    'Total cache hits',
    ['cache_type']
)

cache_misses = Counter(
    'cache_misses_total',
    'Total cache misses',
    ['cache_type']
)


def init_sentry():
    """Initialize Sentry error tracking"""
    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                SqlalchemyIntegration(),
                RedisIntegration(),
            ],
            traces_sample_rate=0.1 if settings.ENVIRONMENT == "production" else 1.0,
            profiles_sample_rate=0.1 if settings.ENVIRONMENT == "production" else 1.0,
            attach_stacktrace=True,
            send_default_pii=False,  # Don't send personally identifiable information
            before_send=before_send_filter,
        )
        logger.info("Sentry initialized successfully")


def before_send_filter(event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Filter sensitive data before sending to Sentry"""
    # Filter out sensitive data from request
    if "request" in event and "data" in event["request"]:
        sensitive_fields = ["password", "token", "api_key", "secret", "credit_card"]
        for field in sensitive_fields:
            if field in event["request"]["data"]:
                event["request"]["data"][field] = "[FILTERED]"
    
    # Don't send events in development unless explicitly enabled
    if settings.ENVIRONMENT == "development" and not settings.SENTRY_SEND_IN_DEV:
        return None
    
    return event


class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware to collect HTTP metrics"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip metrics endpoint itself
        if request.url.path == "/metrics":
            return await call_next(request)
        
        # Start timing
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        
        # Clean up endpoint path for metrics
        endpoint = request.url.path
        if endpoint.startswith("/api/v1"):
            endpoint = endpoint[7:]  # Remove /api/v1 prefix
        
        # Record request metrics
        http_requests_total.labels(
            method=request.method,
            endpoint=endpoint,
            status=response.status_code
        ).inc()
        
        http_request_duration_seconds.labels(
            method=request.method,
            endpoint=endpoint
        ).observe(duration)
        
        return response


class PerformanceMonitor:
    """Context manager for monitoring performance of code blocks"""
    
    def __init__(self, operation_name: str, **labels):
        self.operation_name = operation_name
        self.labels = labels
        self.histogram = Histogram(
            f'{operation_name}_duration_seconds',
            f'Duration of {operation_name} operations',
            list(labels.keys())
        )
    
    @contextmanager
    def measure(self):
        """Measure execution time of a code block"""
        start_time = time.time()
        try:
            yield
        finally:
            duration = time.time() - start_time
            self.histogram.labels(**self.labels).observe(duration)


def track_agent_execution(agent_type: str, status: str):
    """Track agent execution metrics"""
    agent_executions_total.labels(agent_type=agent_type, status=status).inc()


def track_rag_query(status: str):
    """Track RAG query metrics"""
    rag_queries_total.labels(status=status).inc()


def track_marketplace_transaction(transaction_type: str, status: str):
    """Track marketplace transaction metrics"""
    marketplace_transactions_total.labels(type=transaction_type, status=status).inc()


def track_cache_hit(cache_type: str):
    """Track cache hit"""
    cache_hits.labels(cache_type=cache_type).inc()


def track_cache_miss(cache_type: str):
    """Track cache miss"""
    cache_misses.labels(cache_type=cache_type).inc()


def update_active_users(count: int):
    """Update active users gauge"""
    active_users.set(count)


def update_database_connections(count: int):
    """Update database connections gauge"""
    database_connections.set(count)


async def metrics_endpoint(request: Request) -> Response:
    """Endpoint to expose Prometheus metrics"""
    return Response(content=generate_latest(), media_type="text/plain")


# Health check response models
class HealthStatus:
    """Health check status"""
    
    def __init__(self):
        self.services = {}
        self.overall_status = "healthy"
    
    def add_service(self, name: str, status: str, details: Optional[Dict[str, Any]] = None):
        """Add service health status"""
        self.services[name] = {
            "status": status,
            "details": details or {}
        }
        if status != "healthy":
            self.overall_status = "degraded" if self.overall_status == "healthy" else "unhealthy"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "status": self.overall_status,
            "services": self.services,
            "timestamp": time.time()
        }
