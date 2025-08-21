# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Caching service for CodexOS
"""

import json
import pickle
from typing import Optional, Any, Union, Callable
from functools import wraps
import hashlib
import redis.asyncio as redis

from app.core.config import settings
from app.core.monitoring import track_cache_hit, track_cache_miss


class CacheManager:
    """Redis-based cache manager with monitoring"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.default_ttl = settings.CACHE_TTL
    
    async def connect(self):
        """Connect to Redis"""
        if not self.redis_client:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=False  # We'll handle encoding/decoding
            )
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
    
    def _generate_key(self, namespace: str, key: str) -> str:
        """Generate cache key with namespace"""
        return f"codexos:{namespace}:{key}"
    
    async def get(
        self, 
        namespace: str, 
        key: str, 
        deserializer: str = "json"
    ) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis_client:
            await self.connect()
        
        full_key = self._generate_key(namespace, key)
        try:
            value = await self.redis_client.get(full_key)
            if value is None:
                track_cache_miss(namespace)
                return None
            
            track_cache_hit(namespace)
            
            # Deserialize based on type
            if deserializer == "json":
                return json.loads(value)
            elif deserializer == "pickle":
                return pickle.loads(value)
            else:
                return value.decode("utf-8") if isinstance(value, bytes) else value
                
        except Exception as e:
            # Log error but don't crash
            print(f"Cache get error: {e}")
            track_cache_miss(namespace)
            return None
    
    async def set(
        self,
        namespace: str,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        serializer: str = "json"
    ) -> bool:
        """Set value in cache"""
        if not self.redis_client:
            await self.connect()
        
        full_key = self._generate_key(namespace, key)
        ttl = ttl or self.default_ttl
        
        try:
            # Serialize based on type
            if serializer == "json":
                serialized = json.dumps(value)
            elif serializer == "pickle":
                serialized = pickle.dumps(value)
            else:
                serialized = str(value)
            
            await self.redis_client.setex(full_key, ttl, serialized)
            return True
            
        except Exception as e:
            # Log error but don't crash
            print(f"Cache set error: {e}")
            return False
    
    async def delete(self, namespace: str, key: str) -> bool:
        """Delete value from cache"""
        if not self.redis_client:
            await self.connect()
        
        full_key = self._generate_key(namespace, key)
        try:
            result = await self.redis_client.delete(full_key)
            return result > 0
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    async def clear_namespace(self, namespace: str) -> int:
        """Clear all keys in a namespace"""
        if not self.redis_client:
            await self.connect()
        
        pattern = self._generate_key(namespace, "*")
        try:
            keys = []
            async for key in self.redis_client.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
            
        except Exception as e:
            print(f"Cache clear error: {e}")
            return 0
    
    async def get_or_set(
        self,
        namespace: str,
        key: str,
        factory: Callable,
        ttl: Optional[int] = None,
        serializer: str = "json"
    ) -> Any:
        """Get from cache or compute and set"""
        # Try to get from cache first
        value = await self.get(namespace, key, serializer)
        if value is not None:
            return value
        
        # Compute value
        if asyncio.iscoroutinefunction(factory):
            value = await factory()
        else:
            value = factory()
        
        # Cache the result
        await self.set(namespace, key, value, ttl, serializer)
        
        return value


# Global cache instance
cache_manager = CacheManager()


def cached(
    namespace: str,
    ttl: Optional[int] = None,
    key_prefix: str = "",
    serializer: str = "json"
):
    """Decorator for caching function results"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_parts = [key_prefix or func.__name__]
            
            # Add args to key
            for arg in args:
                if hasattr(arg, 'id'):  # For model instances
                    key_parts.append(str(arg.id))
                elif isinstance(arg, (str, int, float, bool)):
                    key_parts.append(str(arg))
                else:
                    # Hash complex objects
                    key_parts.append(hashlib.md5(str(arg).encode()).hexdigest()[:8])
            
            # Add kwargs to key
            for k, v in sorted(kwargs.items()):
                if isinstance(v, (str, int, float, bool)):
                    key_parts.append(f"{k}:{v}")
                else:
                    key_parts.append(f"{k}:{hashlib.md5(str(v).encode()).hexdigest()[:8]}")
            
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            cached_value = await cache_manager.get(namespace, cache_key, serializer)
            if cached_value is not None:
                return cached_value
            
            # Call the function
            result = await func(*args, **kwargs)
            
            # Cache the result
            await cache_manager.set(namespace, cache_key, result, ttl, serializer)
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # For sync functions, we can't use async cache
            # Just call the function directly
            return func(*args, **kwargs)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator


def invalidate_cache(namespace: str, key: Optional[str] = None):
    """Decorator to invalidate cache after function execution"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            
            # Invalidate cache
            if key:
                await cache_manager.delete(namespace, key)
            else:
                await cache_manager.clear_namespace(namespace)
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            # For sync functions, we'd need to run async in sync context
            # which is complex, so we skip cache invalidation
            return result
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator


# Specific cache namespaces
class CacheNamespace:
    """Cache namespace constants"""
    USERS = "users"
    AGENTS = "agents"
    RAG = "rag"
    MARKETPLACE = "marketplace"
    VAULT = "vault"
    SESSIONS = "sessions"
    PERMISSIONS = "permissions"


import asyncio
