# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Performance Optimization Service for production scale
"""

import os
import time
import asyncio
from typing import Dict, Any, Optional, List, Callable
from datetime import datetime, timedelta
from functools import wraps
import json
import pickle
import hashlib
from contextlib import asynccontextmanager
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from sqlalchemy import text, event
import structlog
from prometheus_client import Counter, Histogram, Gauge
import psutil
import aiofiles

from app.core.config import settings

logger = structlog.get_logger()


# Prometheus metrics - initialize only once
_metrics_initialized = False

def _init_metrics():
    global _metrics_initialized, cache_hits, cache_misses, db_query_duration, api_request_duration
    global active_connections, memory_usage, cpu_usage
    
    if _metrics_initialized:
        return
    
    try:
        cache_hits = Counter('cache_hits_total', 'Total number of cache hits')
        cache_misses = Counter('cache_misses_total', 'Total number of cache misses')
        db_query_duration = Histogram('db_query_duration_seconds', 'Database query duration')
        api_request_duration = Histogram('api_request_duration_seconds', 'API request duration', ['method', 'endpoint'])
        active_connections = Gauge('active_db_connections', 'Number of active database connections')
        memory_usage = Gauge('memory_usage_bytes', 'Memory usage in bytes')
        cpu_usage = Gauge('cpu_usage_percent', 'CPU usage percentage')
        
        _metrics_initialized = True
    except ValueError:
        # Metrics already registered, ignore
        pass

# Initialize metrics
_init_metrics()


class CacheBackend:
    """Abstract cache backend"""
    
    async def get(self, key: str) -> Optional[Any]:
        raise NotImplementedError
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        raise NotImplementedError
    
    async def delete(self, key: str):
        raise NotImplementedError
    
    async def clear(self):
        raise NotImplementedError


class RedisCache(CacheBackend):
    """Redis cache backend"""
    
    def __init__(self, redis_client: redis.Redis):
        self.client = redis_client
    
    async def get(self, key: str) -> Optional[Any]:
        try:
            value = await self.client.get(key)
            if value:
                cache_hits.inc()
                return pickle.loads(value)
            cache_misses.inc()
            return None
        except Exception as e:
            logger.error("Redis get error", key=key, error=str(e))
            cache_misses.inc()
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        try:
            serialized = pickle.dumps(value)
            if ttl:
                await self.client.setex(key, ttl, serialized)
            else:
                await self.client.set(key, serialized)
        except Exception as e:
            logger.error("Redis set error", key=key, error=str(e))
    
    async def delete(self, key: str):
        try:
            await self.client.delete(key)
        except Exception as e:
            logger.error("Redis delete error", key=key, error=str(e))
    
    async def clear(self):
        try:
            await self.client.flushdb()
        except Exception as e:
            logger.error("Redis clear error", error=str(e))


class InMemoryCache(CacheBackend):
    """In-memory cache backend for testing"""
    
    def __init__(self):
        self.cache: Dict[str, tuple[Any, Optional[float]]] = {}
        self._cleanup_task = asyncio.create_task(self._cleanup_expired())
    
    async def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            value, expiry = self.cache[key]
            if expiry is None or time.time() < expiry:
                cache_hits.inc()
                return value
            else:
                del self.cache[key]
        cache_misses.inc()
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        expiry = time.time() + ttl if ttl else None
        self.cache[key] = (value, expiry)
    
    async def delete(self, key: str):
        self.cache.pop(key, None)
    
    async def clear(self):
        self.cache.clear()
    
    async def _cleanup_expired(self):
        """Periodically clean up expired entries"""
        while True:
            await asyncio.sleep(60)  # Run every minute
            current_time = time.time()
            expired_keys = [
                k for k, (_, expiry) in self.cache.items()
                if expiry and current_time > expiry
            ]
            for key in expired_keys:
                del self.cache[key]


class PerformanceService:
    """Service for performance optimization"""
    
    def __init__(self):
        self._cache: Optional[CacheBackend] = None
        self._redis_client: Optional[redis.Redis] = None
        self._db_engine: Optional[Any] = None
        self._initialize()
    
    def _initialize(self):
        """Initialize performance optimizations"""
        # Initialize cache
        if hasattr(settings, 'REDIS_URL') and settings.REDIS_URL:
            self._redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=False,
            )
            self._cache = RedisCache(self._redis_client)
            logger.info("Redis cache initialized")
        else:
            self._cache = InMemoryCache()
            logger.info("In-memory cache initialized")
        
        # Initialize optimized database engine
        self._setup_database_optimization()
        
        # Start system monitoring
        asyncio.create_task(self._monitor_system_metrics())
    
    def _setup_database_optimization(self):
        """Setup optimized database connection pooling"""
        # Use the existing database engine from the main app
        # The engine will be set later via set_database_engine method
        self._db_engine = None
        
        # Note: Event listeners will be set up when the engine is provided
    
    def set_database_engine(self, engine):
        """Set the database engine from the main app"""
        self._db_engine = engine
        
        # Add event listeners for monitoring
        if self._db_engine and hasattr(self._db_engine, 'sync_engine'):
            @event.listens_for(self._db_engine.sync_engine, "connect")
            def receive_connect(dbapi_conn, connection_record):
                active_connections.inc()
            
            @event.listens_for(self._db_engine.sync_engine, "close")
            def receive_close(dbapi_conn, connection_record):
                active_connections.dec()
    
    def get_optimized_session_factory(self) -> async_sessionmaker:
        """Get optimized session factory"""
        if not self._db_engine:
            raise RuntimeError("Database engine not set. Call set_database_engine() first.")
        
        return async_sessionmaker(
            self._db_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,  # Disable autoflush for better control
        )
    
    async def _monitor_system_metrics(self):
        """Monitor system metrics"""
        while True:
            try:
                # Memory usage
                process = psutil.Process()
                memory_info = process.memory_info()
                memory_usage.set(memory_info.rss)
                
                # CPU usage
                cpu_percent = process.cpu_percent(interval=1)
                cpu_usage.set(cpu_percent)
                
                await asyncio.sleep(30)  # Update every 30 seconds
            except Exception as e:
                logger.error("System monitoring error", error=str(e))
                await asyncio.sleep(60)
    
    def cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key"""
        key_data = {
            "prefix": prefix,
            "args": args,
            "kwargs": kwargs,
        }
        key_str = json.dumps(key_data, sort_keys=True)
        key_hash = hashlib.md5(key_str.encode()).hexdigest()
        return f"{prefix}:{key_hash}"
    
    def cached(self, ttl: int = 300, prefix: Optional[str] = None):
        """Decorator for caching function results"""
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_prefix = prefix or f"{func.__module__}.{func.__name__}"
                key = self.cache_key(cache_prefix, *args, **kwargs)
                
                # Try to get from cache
                cached_value = await self._cache.get(key)
                if cached_value is not None:
                    return cached_value
                
                # Execute function and cache result
                result = await func(*args, **kwargs)
                await self._cache.set(key, result, ttl)
                
                return result
            
            return wrapper
        return decorator
    
    async def invalidate_cache(self, pattern: str):
        """Invalidate cache entries matching pattern"""
        if isinstance(self._cache, RedisCache):
            # Use Redis SCAN for pattern matching
            cursor = 0
            while True:
                cursor, keys = await self._redis_client.scan(
                    cursor, match=pattern, count=100
                )
                if keys:
                    await self._redis_client.delete(*keys)
                if cursor == 0:
                    break
        else:
            # For in-memory cache, iterate through keys
            keys_to_delete = [
                k for k in self._cache.cache.keys()
                if pattern.replace("*", "") in k
            ]
            for key in keys_to_delete:
                await self._cache.delete(key)
    
    @asynccontextmanager
    async def query_performance_tracker(self, query_name: str):
        """Context manager for tracking query performance"""
        start_time = time.time()
        try:
            yield
        finally:
            duration = time.time() - start_time
            db_query_duration.observe(duration)
            
            if duration > 1.0:  # Log slow queries
                logger.warning(
                    "Slow query detected",
                    query_name=query_name,
                    duration_seconds=duration,
                )
    
    async def bulk_insert(
        self,
        db: AsyncSession,
        model: Any,
        data: List[Dict[str, Any]],
        batch_size: int = 1000,
    ):
        """Optimized bulk insert"""
        async with self.query_performance_tracker(f"bulk_insert_{model.__tablename__}"):
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                await db.execute(
                    model.__table__.insert(),
                    batch,
                )
                await db.commit()
    
    async def optimize_query(self, query: Any) -> Any:
        """Apply query optimizations"""
        # Add query hints
        query = query.execution_options(
            synchronize_session=False,
            populate_existing=True,
        )
        
        return query
    
    def request_performance_tracker(self, method: str, endpoint: str):
        """Decorator for tracking API request performance"""
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    return result
                finally:
                    duration = time.time() - start_time
                    api_request_duration.labels(
                        method=method,
                        endpoint=endpoint,
                    ).observe(duration)
                    
                    if duration > 2.0:  # Log slow requests
                        logger.warning(
                            "Slow API request",
                            method=method,
                            endpoint=endpoint,
                            duration_seconds=duration,
                        )
            
            return wrapper
        return decorator
    
    async def parallel_execute(self, tasks: List[Callable], max_concurrent: int = 10):
        """Execute tasks in parallel with concurrency limit"""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def execute_with_limit(task):
            async with semaphore:
                return await task()
        
        return await asyncio.gather(
            *[execute_with_limit(task) for task in tasks],
            return_exceptions=True,
        )
    
    async def write_large_file_streaming(self, file_path: str, data_generator):
        """Write large files using streaming to avoid memory issues"""
        async with aiofiles.open(file_path, 'wb') as f:
            async for chunk in data_generator:
                await f.write(chunk)
    
    async def read_large_file_streaming(self, file_path: str, chunk_size: int = 8192):
        """Read large files using streaming"""
        async with aiofiles.open(file_path, 'rb') as f:
            while True:
                chunk = await f.read(chunk_size)
                if not chunk:
                    break
                yield chunk
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get current performance statistics"""
        process = psutil.Process()
        
        return {
            "memory": {
                "rss_mb": process.memory_info().rss / 1024 / 1024,
                "percent": process.memory_percent(),
            },
            "cpu": {
                "percent": process.cpu_percent(interval=0.1),
                "threads": process.num_threads(),
            },
            "cache": {
                "hits": cache_hits._value._value if hasattr(cache_hits, '_value') else 0,
                "misses": cache_misses._value._value if hasattr(cache_misses, '_value') else 0,
                "hit_rate": self._calculate_cache_hit_rate(),
            },
            "database": {
                "active_connections": active_connections._value._value if hasattr(active_connections, '_value') else 0,
            },
        }
    
    def _calculate_cache_hit_rate(self) -> float:
        """Calculate cache hit rate"""
        hits = cache_hits._value._value if hasattr(cache_hits, '_value') else 0
        misses = cache_misses._value._value if hasattr(cache_misses, '_value') else 0
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0


# Singleton instance
performance_service = PerformanceService()
