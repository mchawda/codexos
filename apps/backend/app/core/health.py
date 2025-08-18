"""
Health check system for monitoring service availability
"""

import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
import httpx
import redis.asyncio as redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.monitoring import HealthStatus
from app.db.session import engine


class HealthChecker:
    """Comprehensive health check system"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.http_client = httpx.AsyncClient(timeout=5.0)
    
    async def __aenter__(self):
        """Initialize connections"""
        try:
            self.redis_client = redis.from_url(settings.REDIS_URL)
        except Exception:
            self.redis_client = None
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up connections"""
        if self.redis_client:
            await self.redis_client.close()
        await self.http_client.aclose()
    
    async def check_database(self) -> Dict[str, Any]:
        """Check database connectivity and performance"""
        start_time = datetime.utcnow()
        try:
            async with AsyncSession(engine) as session:
                # Simple query to check connectivity
                result = await session.execute(text("SELECT 1"))
                result.scalar()
                
                # Check connection pool
                pool_status = engine.pool.status()
                
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "status": "healthy",
                "response_time_seconds": response_time,
                "pool_size": pool_status.split()[0],
                "pool_checked_out": pool_status.split()[2],
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "response_time_seconds": (datetime.utcnow() - start_time).total_seconds()
            }
    
    async def check_redis(self) -> Dict[str, Any]:
        """Check Redis connectivity and performance"""
        if not self.redis_client:
            return {"status": "unavailable", "error": "Redis client not initialized"}
        
        start_time = datetime.utcnow()
        try:
            # Ping Redis
            await self.redis_client.ping()
            
            # Get info
            info = await self.redis_client.info()
            
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "status": "healthy",
                "response_time_seconds": response_time,
                "connected_clients": info.get("connected_clients", 0),
                "used_memory_human": info.get("used_memory_human", "unknown"),
                "uptime_days": info.get("uptime_in_days", 0),
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "response_time_seconds": (datetime.utcnow() - start_time).total_seconds()
            }
    
    async def check_chroma(self) -> Dict[str, Any]:
        """Check ChromaDB connectivity"""
        start_time = datetime.utcnow()
        try:
            # Check ChromaDB health endpoint
            response = await self.http_client.get(
                f"http://{settings.CHROMA_HOST}:{settings.CHROMA_PORT}/api/v1/heartbeat"
            )
            response.raise_for_status()
            
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "status": "healthy",
                "response_time_seconds": response_time,
                "version": response.json().get("version", "unknown")
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "response_time_seconds": (datetime.utcnow() - start_time).total_seconds()
            }
    
    async def check_external_services(self) -> Dict[str, Any]:
        """Check external service connectivity"""
        services = {}
        
        # Check OpenAI if configured
        if settings.OPENAI_API_KEY:
            start_time = datetime.utcnow()
            try:
                response = await self.http_client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    timeout=10.0
                )
                response.raise_for_status()
                services["openai"] = {
                    "status": "healthy",
                    "response_time_seconds": (datetime.utcnow() - start_time).total_seconds()
                }
            except Exception as e:
                services["openai"] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "response_time_seconds": (datetime.utcnow() - start_time).total_seconds()
                }
        
        # Check Stripe if configured
        if settings.STRIPE_API_KEY:
            start_time = datetime.utcnow()
            try:
                response = await self.http_client.get(
                    "https://api.stripe.com/v1/balance",
                    auth=(settings.STRIPE_API_KEY, ""),
                    timeout=10.0
                )
                response.raise_for_status()
                services["stripe"] = {
                    "status": "healthy",
                    "response_time_seconds": (datetime.utcnow() - start_time).total_seconds()
                }
            except Exception as e:
                services["stripe"] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "response_time_seconds": (datetime.utcnow() - start_time).total_seconds()
                }
        
        return services
    
    async def get_system_health(self) -> HealthStatus:
        """Get comprehensive system health status"""
        health = HealthStatus()
        
        # Run all checks concurrently
        results = await asyncio.gather(
            self.check_database(),
            self.check_redis(),
            self.check_chroma(),
            self.check_external_services(),
            return_exceptions=True
        )
        
        # Process results
        if isinstance(results[0], dict):
            health.add_service("database", results[0]["status"], results[0])
        else:
            health.add_service("database", "error", {"error": str(results[0])})
        
        if isinstance(results[1], dict):
            health.add_service("redis", results[1]["status"], results[1])
        else:
            health.add_service("redis", "error", {"error": str(results[1])})
        
        if isinstance(results[2], dict):
            health.add_service("chroma", results[2]["status"], results[2])
        else:
            health.add_service("chroma", "error", {"error": str(results[2])})
        
        if isinstance(results[3], dict):
            for service_name, service_data in results[3].items():
                health.add_service(service_name, service_data["status"], service_data)
        
        return health


async def get_health_status() -> Dict[str, Any]:
    """Get current health status"""
    async with HealthChecker() as checker:
        health = await checker.get_system_health()
        return health.to_dict()
