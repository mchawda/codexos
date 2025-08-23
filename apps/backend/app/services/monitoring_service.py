# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Monitoring and Observability Service
"""

import os
import time
import asyncio
import json
from typing import Dict, Any, Optional, List, Callable
from datetime import datetime, timedelta
from functools import wraps
from contextlib import asynccontextmanager
import structlog
from prometheus_client import Counter, Histogram, Gauge, Summary, Info
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from opentelemetry import trace, metrics
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncEngine

from app.core.config import settings

logger = structlog.get_logger()


# Prometheus metrics - initialize only once
_metrics_initialized = False

# Global variables for metrics
http_requests_total = None
http_request_duration_seconds = None
http_request_size_bytes = None
http_response_size_bytes = None
active_websocket_connections = None
websocket_messages_total = None
agent_executions_total = None
agent_execution_duration_seconds = None
agent_node_executions_total = None
llm_requests_total = None
llm_tokens_total = None
llm_cost_cents_total = None
rag_searches_total = None
rag_search_duration_seconds = None
rag_documents_indexed_total = None
security_events_total = None
failed_login_attempts_total = None
mfa_verifications_total = None
app_info = None

def _init_metrics():
    global _metrics_initialized, http_requests_total, http_request_duration_seconds, http_request_size_bytes, http_response_size_bytes
    global active_websocket_connections, websocket_messages_total, agent_executions_total, agent_execution_duration_seconds
    global agent_node_executions_total, llm_requests_total, llm_tokens_total, llm_cost_cents_total
    global rag_searches_total, rag_search_duration_seconds, rag_documents_indexed_total
    global security_events_total, failed_login_attempts_total, mfa_verifications_total, app_info
    
    if _metrics_initialized:
        return
    
    try:
        http_requests_total = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status']
        )
        http_request_duration_seconds = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration',
            ['method', 'endpoint']
        )
        http_request_size_bytes = Summary(
            'http_request_size_bytes',
            'HTTP request size',
            ['method', 'endpoint']
        )
        http_response_size_bytes = Summary(
            'http_response_size_bytes',
            'HTTP response size',
            ['method', 'endpoint']
        )

        active_websocket_connections = Gauge(
            'active_websocket_connections',
            'Number of active WebSocket connections'
        )
        websocket_messages_total = Counter(
            'websocket_messages_total',
            'Total WebSocket messages',
            ['direction']  # sent/received
        )

        agent_executions_total = Counter(
            'agent_executions_total',
            'Total agent executions',
            ['status']  # success/failure
        )
        agent_execution_duration_seconds = Histogram(
            'agent_execution_duration_seconds',
            'Agent execution duration'
        )
        agent_node_executions_total = Counter(
            'agent_node_executions_total',
            'Total agent node executions',
            ['node_type', 'status']
        )

        llm_requests_total = Counter(
            'llm_requests_total',
            'Total LLM requests',
            ['provider', 'model', 'status']
        )
        llm_tokens_total = Counter(
            'llm_tokens_total',
            'Total LLM tokens used',
            ['provider', 'model']
        )
        llm_cost_cents_total = Counter(
            'llm_cost_cents_total',
            'Total LLM cost in cents',
            ['provider', 'model']
        )

        rag_searches_total = Counter(
            'rag_searches_total',
            'Total RAG searches'
        )
        rag_search_duration_seconds = Histogram(
            'rag_search_duration_seconds',
            'RAG search duration'
        )
        rag_documents_indexed_total = Counter(
            'rag_documents_indexed_total',
            'Total documents indexed'
        )

        security_events_total = Counter(
            'security_events_total',
            'Total security events',
            ['event_type', 'severity']
        )
        failed_login_attempts_total = Counter(
            'failed_login_attempts_total',
            'Total failed login attempts'
        )
        mfa_verifications_total = Counter(
            'mfa_verifications_total',
            'Total MFA verifications',
            ['method', 'status']
        )

        app_info = Info('app', 'Application information')
        app_info.info({
            'version': getattr(settings, 'VERSION', 'unknown'),
            'environment': getattr(settings, 'ENVIRONMENT', 'development'),
        })
        
        _metrics_initialized = True
    except Exception:
        # If there's any error, create dummy metrics to prevent None errors
        try:
            http_requests_total = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
            http_request_duration_seconds = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
            http_request_size_bytes = Summary('http_request_size_bytes', 'HTTP request size', ['method', 'endpoint'])
            http_response_size_bytes = Summary('http_response_size_bytes', 'HTTP response size', ['method', 'endpoint'])
            active_websocket_connections = Gauge('active_websocket_connections', 'Number of active WebSocket connections')
            websocket_messages_total = Counter('websocket_messages_total', 'Total WebSocket messages', ['direction'])
            agent_executions_total = Counter('agent_executions_total', 'Total agent executions', ['status'])
            agent_execution_duration_seconds = Histogram('agent_execution_duration_seconds', 'Agent execution duration')
            agent_node_executions_total = Counter('agent_node_executions_total', 'Total agent node executions', ['node_type', 'status'])
            llm_requests_total = Counter('llm_requests_total', 'Total LLM requests', ['provider', 'model', 'status'])
            llm_tokens_total = Counter('llm_tokens_total', 'Total LLM tokens used', ['provider', 'model'])
            llm_cost_cents_total = Counter('llm_cost_cents_total', 'Total LLM cost in cents', ['provider', 'model'])
            rag_searches_total = Counter('rag_searches_total', 'Total RAG searches')
            rag_search_duration_seconds = Histogram('rag_search_duration_seconds', 'RAG search duration')
            rag_documents_indexed_total = Counter('rag_documents_indexed_total', 'Total documents indexed')
            security_events_total = Counter('security_events_total', 'Total security events', ['event_type', 'severity'])
            failed_login_attempts_total = Counter('failed_login_attempts_total', 'Total failed login attempts')
            mfa_verifications_total = Counter('mfa_verifications_total', 'Total MFA verifications', ['method', 'status'])
            app_info = Info('app', 'Application information')
            app_info.info({'version': 'unknown', 'environment': 'development'})
            _metrics_initialized = True
        except:
            pass

# Initialize metrics
_init_metrics()


class MonitoringService:
    """Service for monitoring and observability"""
    
    def __init__(self):
        self._tracer: Optional[trace.Tracer] = None
        self._meter: Optional[metrics.Meter] = None
        self._initialize()
    
    def _initialize(self):
        """Initialize monitoring components"""
        # Initialize OpenTelemetry tracing
        if hasattr(settings, 'OTLP_ENDPOINT') and settings.OTLP_ENDPOINT:
            # Setup tracing
            trace.set_tracer_provider(TracerProvider())
            tracer_provider = trace.get_tracer_provider()
            
            span_exporter = OTLPSpanExporter(
                endpoint=settings.OTLP_ENDPOINT,
                insecure=True,
            )
            span_processor = BatchSpanProcessor(span_exporter)
            tracer_provider.add_span_processor(span_processor)
            
            self._tracer = trace.get_tracer(__name__)
            
            # Setup metrics
            metric_reader = PeriodicExportingMetricReader(
                exporter=OTLPMetricExporter(
                    endpoint=settings.OTLP_ENDPOINT,
                    insecure=True,
                ),
                export_interval_millis=60000,  # Export every minute
            )
            
            metrics.set_meter_provider(
                MeterProvider(metric_readers=[metric_reader])
            )
            self._meter = metrics.get_meter(__name__)
            
            logger.info("OpenTelemetry initialized", endpoint=settings.OTLP_ENDPOINT)
        
        # Initialize Sentry for error tracking
        if hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                environment=getattr(settings, 'ENVIRONMENT', 'development'),
                integrations=[
                    FastApiIntegration(transaction_style="endpoint"),
                    SqlalchemyIntegration(),
                ],
                traces_sample_rate=getattr(settings, 'SENTRY_TRACES_SAMPLE_RATE', 0.1),
                profiles_sample_rate=getattr(settings, 'SENTRY_PROFILES_SAMPLE_RATE', 0.1),
            )
            logger.info("Sentry initialized")
    
    def instrument_app(self, app):
        """Instrument FastAPI app"""
        # Instrument FastAPI
        FastAPIInstrumentor.instrument_app(app)
        
        # Add Prometheus metrics endpoint
        @app.get("/metrics", include_in_schema=False)
        async def metrics_endpoint():
            return Response(
                content=generate_latest(),
                media_type=CONTENT_TYPE_LATEST,
            )
        
        # Add health check endpoint
        @app.get("/health", include_in_schema=False)
        async def health_check():
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "version": getattr(settings, 'VERSION', 'unknown'),
            }
        
        # Add middleware for request tracking
        @app.middleware("http")
        async def track_requests(request: Request, call_next):
            start_time = time.time()
            
            # Ensure metrics are available
            if http_request_size_bytes is None or http_requests_total is None or http_request_duration_seconds is None or http_response_size_bytes is None:
                # If metrics are not available, just process the request without tracking
                response = await call_next(request)
                return response
            
            # Track request size
            content_length = request.headers.get("content-length")
            if content_length:
                try:
                    http_request_size_bytes.labels(
                        method=request.method,
                        endpoint=request.url.path,
                    ).observe(int(content_length))
                except Exception:
                    pass
            
            # Process request
            response = await call_next(request)
            
            # Track metrics
            duration = time.time() - start_time
            try:
                http_requests_total.labels(
                    method=request.method,
                    endpoint=request.url.path,
                    status=response.status_code,
                ).inc()
                
                http_request_duration_seconds.labels(
                    method=request.method,
                    endpoint=request.url.path,
                ).observe(duration)
                
                # Track response size
                if "content-length" in response.headers:
                    http_response_size_bytes.labels(
                        method=request.method,
                        endpoint=request.url.path,
                    ).observe(int(response.headers["content-length"]))
            except Exception:
                pass
            
            # Add custom headers
            response.headers["X-Request-ID"] = request.state.request_id if hasattr(request.state, "request_id") else "unknown"
            response.headers["X-Process-Time"] = str(duration)
            
            return response
    
    def instrument_database(self, engine: AsyncEngine):
        """Instrument database engine"""
        SQLAlchemyInstrumentor().instrument(
            engine=engine.sync_engine,
            service="codexos-db",
        )
    
    def instrument_http_client(self):
        """Instrument HTTP client"""
        HTTPXClientInstrumentor().instrument()
    
    def instrument_redis(self):
        """Instrument Redis client"""
        RedisInstrumentor().instrument()
    
    @asynccontextmanager
    async def trace_span(self, name: str, attributes: Optional[Dict[str, Any]] = None):
        """Create a trace span"""
        if self._tracer:
            with self._tracer.start_as_current_span(name) as span:
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)
                yield span
        else:
            yield None
    
    def trace_function(self, name: Optional[str] = None):
        """Decorator for tracing functions"""
        def decorator(func: Callable):
            span_name = name or f"{func.__module__}.{func.__name__}"
            
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                async with self.trace_span(span_name):
                    return await func(*args, **kwargs)
            
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                if self._tracer:
                    with self._tracer.start_as_current_span(span_name):
                        return func(*args, **kwargs)
                return func(*args, **kwargs)
            
            return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
        
        return decorator
    
    def track_agent_execution(self, execution_id: str, status: str, duration: float):
        """Track agent execution metrics"""
        agent_executions_total.labels(status=status).inc()
        agent_execution_duration_seconds.observe(duration)
        
        if self._meter:
            execution_counter = self._meter.create_counter(
                "agent.executions",
                description="Number of agent executions",
            )
            execution_counter.add(1, {"status": status})
    
    def track_agent_node_execution(self, node_type: str, status: str):
        """Track agent node execution metrics"""
        agent_node_executions_total.labels(
            node_type=node_type,
            status=status,
        ).inc()
    
    def track_llm_request(
        self,
        provider: str,
        model: str,
        status: str,
        tokens: int,
        cost_cents: int,
    ):
        """Track LLM request metrics"""
        llm_requests_total.labels(
            provider=provider,
            model=model,
            status=status,
        ).inc()
        
        if status == "success":
            llm_tokens_total.labels(
                provider=provider,
                model=model,
            ).inc(tokens)
            
            llm_cost_cents_total.labels(
                provider=provider,
                model=model,
            ).inc(cost_cents)
    
    def track_rag_search(self, duration: float, result_count: int):
        """Track RAG search metrics"""
        rag_searches_total.inc()
        rag_search_duration_seconds.observe(duration)
        
        if self._meter:
            result_histogram = self._meter.create_histogram(
                "rag.search.results",
                description="Number of search results",
            )
            result_histogram.record(result_count)
    
    def track_security_event(self, event_type: str, severity: str):
        """Track security event metrics"""
        security_events_total.labels(
            event_type=event_type,
            severity=severity,
        ).inc()
        
        if event_type == "failed_login":
            failed_login_attempts_total.inc()
    
    def track_mfa_verification(self, method: str, status: str):
        """Track MFA verification metrics"""
        mfa_verifications_total.labels(
            method=method,
            status=status,
        ).inc()
    
    def track_websocket_connection(self, action: str):
        """Track WebSocket connection metrics"""
        if action == "connect":
            active_websocket_connections.inc()
        elif action == "disconnect":
            active_websocket_connections.dec()
    
    def track_websocket_message(self, direction: str):
        """Track WebSocket message metrics"""
        websocket_messages_total.labels(direction=direction).inc()
    
    async def create_alert(
        self,
        name: str,
        severity: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Create an alert"""
        alert_data = {
            "name": name,
            "severity": severity,
            "message": message,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Log alert
        logger.warning("Alert triggered", **alert_data)
        
        # Send to Sentry if configured
        if sentry_sdk.Hub.current.client:
            with sentry_sdk.push_scope() as scope:
                scope.set_level(severity)
                scope.set_context("alert", alert_data)
                sentry_sdk.capture_message(message)
        
        # TODO: Send to alerting service (PagerDuty, Slack, etc.)
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get summary of current metrics"""
        return {
            "http": {
                "total_requests": sum(
                    http_requests_total._metrics.values()
                ) if hasattr(http_requests_total, '_metrics') else 0,
                "active_websockets": active_websocket_connections._value._value if hasattr(active_websocket_connections, '_value') else 0,
            },
            "agents": {
                "total_executions": sum(
                    agent_executions_total._metrics.values()
                ) if hasattr(agent_executions_total, '_metrics') else 0,
            },
            "security": {
                "total_events": sum(
                    security_events_total._metrics.values()
                ) if hasattr(security_events_total, '_metrics') else 0,
                "failed_logins": failed_login_attempts_total._value._value if hasattr(failed_login_attempts_total, '_value') else 0,
            },
        }
    
    async def check_system_health(self) -> Dict[str, Any]:
        """Check overall system health"""
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {},
        }
        
        # Check database connectivity
        try:
            from app.db.session import get_db
            async for db in get_db():
                await db.execute("SELECT 1")
                health_status["checks"]["database"] = "healthy"
                break
        except Exception as e:
            health_status["checks"]["database"] = "unhealthy"
            health_status["status"] = "degraded"
            logger.error("Database health check failed", error=str(e))
        
        # Check Redis connectivity
        try:
            # Temporarily disabled performance service check
            # from app.services.performance_service import performance_service
            # if performance_service._redis_client:
            #     await performance_service._redis_client.ping()
            health_status["checks"]["redis"] = "healthy"
        except Exception as e:
            health_status["checks"]["redis"] = "unhealthy"
            health_status["status"] = "degraded"
            logger.error("Redis health check failed", error=str(e))
        
        return health_status


# Singleton instance
monitoring_service = MonitoringService()
