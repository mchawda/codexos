# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import os
from typing import Dict, Any, List, Optional, Union
from abc import ABC, abstractmethod
import asyncio
import json
from datetime import datetime
import httpx
from pydantic import BaseModel, Field
import structlog

logger = structlog.get_logger()


class LLMMessage(BaseModel):
    role: str  # system, user, assistant
    content: str
    name: Optional[str] = None
    function_call: Optional[Dict[str, Any]] = None


class LLMConfig(BaseModel):
    model: str
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    stream: bool = False
    functions: Optional[List[Dict[str, Any]]] = None
    function_call: Optional[Union[str, Dict[str, str]]] = None
    response_format: Optional[Dict[str, str]] = None


class LLMResponse(BaseModel):
    content: Optional[str] = None
    function_call: Optional[Dict[str, Any]] = None
    tokens_used: int = 0
    cost_cents: int = 0
    model: str
    provider: str
    latency_ms: int = 0


class BaseLLMProvider(ABC):
    """Base class for LLM providers"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = httpx.AsyncClient()
    
    @abstractmethod
    async def complete(self, messages: List[LLMMessage], config: LLMConfig) -> LLMResponse:
        """Complete a chat conversation"""
        pass
    
    @abstractmethod
    def calculate_cost(self, tokens_used: int, model: str) -> int:
        """Calculate cost in cents"""
        pass


class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT provider"""
    
    BASE_URL = "https://api.openai.com/v1"
    
    PRICING = {
        "gpt-4": {"input": 0.03, "output": 0.06},  # per 1K tokens
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    }
    
    async def complete(self, messages: List[LLMMessage], config: LLMConfig) -> LLMResponse:
        start_time = datetime.utcnow()
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        body = {
            "model": config.model,
            "messages": [msg.dict(exclude_none=True) for msg in messages],
            "temperature": config.temperature,
            "top_p": config.top_p,
            "frequency_penalty": config.frequency_penalty,
            "presence_penalty": config.presence_penalty,
            "stream": False,  # We don't support streaming yet
        }
        
        if config.max_tokens:
            body["max_tokens"] = config.max_tokens
        if config.functions:
            body["functions"] = config.functions
        if config.function_call:
            body["function_call"] = config.function_call
        if config.response_format:
            body["response_format"] = config.response_format
        
        try:
            response = await self.client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=headers,
                json=body,
                timeout=60.0,
            )
            response.raise_for_status()
            
            data = response.json()
            choice = data["choices"][0]
            usage = data["usage"]
            
            tokens_used = usage["total_tokens"]
            cost_cents = self.calculate_cost(tokens_used, config.model)
            
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return LLMResponse(
                content=choice["message"].get("content"),
                function_call=choice["message"].get("function_call"),
                tokens_used=tokens_used,
                cost_cents=cost_cents,
                model=config.model,
                provider="openai",
                latency_ms=latency_ms,
            )
            
        except httpx.HTTPStatusError as e:
            logger.error("OpenAI API error", status_code=e.response.status_code, response=e.response.text)
            raise
        except Exception as e:
            logger.error("OpenAI API error", error=str(e))
            raise
    
    def calculate_cost(self, tokens_used: int, model: str) -> int:
        """Calculate cost in cents"""
        pricing = self.PRICING.get(model, self.PRICING["gpt-3.5-turbo"])
        # Rough estimate: 75% input, 25% output
        input_tokens = int(tokens_used * 0.75)
        output_tokens = tokens_used - input_tokens
        
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1000
        return int(cost * 100)  # Convert to cents


class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude provider"""
    
    BASE_URL = "https://api.anthropic.com/v1"
    
    PRICING = {
        "claude-3-opus": {"input": 0.015, "output": 0.075},  # per 1K tokens
        "claude-3-sonnet": {"input": 0.003, "output": 0.015},
        "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
        "claude-2.1": {"input": 0.008, "output": 0.024},
    }
    
    async def complete(self, messages: List[LLMMessage], config: LLMConfig) -> LLMResponse:
        start_time = datetime.utcnow()
        
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        
        # Convert messages to Anthropic format
        system_message = next((msg.content for msg in messages if msg.role == "system"), "")
        conversation = [
            {"role": msg.role if msg.role != "system" else "user", "content": msg.content}
            for msg in messages if msg.role != "system"
        ]
        
        body = {
            "model": config.model,
            "messages": conversation,
            "temperature": config.temperature,
            "top_p": config.top_p,
            "max_tokens": config.max_tokens or 4096,
        }
        
        if system_message:
            body["system"] = system_message
        
        try:
            response = await self.client.post(
                f"{self.BASE_URL}/messages",
                headers=headers,
                json=body,
                timeout=60.0,
            )
            response.raise_for_status()
            
            data = response.json()
            content = data["content"][0]["text"] if data["content"] else ""
            usage = data.get("usage", {})
            
            tokens_used = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
            cost_cents = self.calculate_cost(tokens_used, config.model)
            
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return LLMResponse(
                content=content,
                tokens_used=tokens_used,
                cost_cents=cost_cents,
                model=config.model,
                provider="anthropic",
                latency_ms=latency_ms,
            )
            
        except httpx.HTTPStatusError as e:
            logger.error("Anthropic API error", status_code=e.response.status_code, response=e.response.text)
            raise
        except Exception as e:
            logger.error("Anthropic API error", error=str(e))
            raise
    
    def calculate_cost(self, tokens_used: int, model: str) -> int:
        """Calculate cost in cents"""
        pricing = self.PRICING.get(model, self.PRICING["claude-3-haiku"])
        # Rough estimate: 75% input, 25% output
        input_tokens = int(tokens_used * 0.75)
        output_tokens = tokens_used - input_tokens
        
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1000
        return int(cost * 100)  # Convert to cents


class OllamaProvider(BaseLLMProvider):
    """Ollama local LLM provider"""
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.client = httpx.AsyncClient()
    
    async def complete(self, messages: List[LLMMessage], config: LLMConfig) -> LLMResponse:
        start_time = datetime.utcnow()
        
        # Convert messages to Ollama format
        prompt = "\n".join([
            f"{msg.role}: {msg.content}" for msg in messages
        ])
        
        body = {
            "model": config.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": config.temperature,
                "top_p": config.top_p,
            }
        }
        
        if config.max_tokens:
            body["options"]["num_predict"] = config.max_tokens
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=body,
                timeout=120.0,  # Longer timeout for local models
            )
            response.raise_for_status()
            
            data = response.json()
            content = data.get("response", "")
            
            # Ollama doesn't provide token count, estimate it
            tokens_used = len(content.split()) * 1.3  # Rough estimate
            
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return LLMResponse(
                content=content,
                tokens_used=int(tokens_used),
                cost_cents=0,  # Local models are free
                model=config.model,
                provider="ollama",
                latency_ms=latency_ms,
            )
            
        except httpx.HTTPStatusError as e:
            logger.error("Ollama API error", status_code=e.response.status_code, response=e.response.text)
            raise
        except Exception as e:
            logger.error("Ollama API error", error=str(e))
            raise
    
    def calculate_cost(self, tokens_used: int, model: str) -> int:
        """Ollama is free"""
        return 0


class LLMService:
    """Main service for LLM interactions"""
    
    def __init__(self):
        self.providers: Dict[str, BaseLLMProvider] = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available providers based on environment variables"""
        
        # OpenAI
        if openai_key := os.getenv("OPENAI_API_KEY"):
            self.providers["openai"] = OpenAIProvider(openai_key)
            logger.info("OpenAI provider initialized")
        
        # Anthropic
        if anthropic_key := os.getenv("ANTHROPIC_API_KEY"):
            self.providers["anthropic"] = AnthropicProvider(anthropic_key)
            logger.info("Anthropic provider initialized")
        
        # Ollama (always available for local models)
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.providers["ollama"] = OllamaProvider(ollama_url)
        logger.info("Ollama provider initialized", base_url=ollama_url)
    
    def get_provider(self, model: str) -> BaseLLMProvider:
        """Get the appropriate provider for a model"""
        
        # Determine provider from model name
        if model.startswith("gpt"):
            provider_name = "openai"
        elif model.startswith("claude"):
            provider_name = "anthropic"
        else:
            # Assume local/Ollama model
            provider_name = "ollama"
        
        if provider_name not in self.providers:
            raise ValueError(f"Provider {provider_name} not available. Please check API keys.")
        
        return self.providers[provider_name]
    
    async def complete(
        self,
        messages: List[LLMMessage],
        config: LLMConfig,
        user_id: Optional[str] = None,
    ) -> LLMResponse:
        """Complete a chat conversation"""
        
        provider = self.get_provider(config.model)
        
        try:
            # Execute the completion
            response = await provider.complete(messages, config)
            
            # Log the usage for tracking
            logger.info(
                "LLM completion",
                model=config.model,
                provider=response.provider,
                tokens_used=response.tokens_used,
                cost_cents=response.cost_cents,
                latency_ms=response.latency_ms,
                user_id=user_id,
            )
            
            return response
            
        except Exception as e:
            logger.error(
                "LLM completion failed",
                model=config.model,
                error=str(e),
                user_id=user_id,
            )
            raise
    
    async def complete_with_retry(
        self,
        messages: List[LLMMessage],
        config: LLMConfig,
        user_id: Optional[str] = None,
        max_retries: int = 3,
    ) -> LLMResponse:
        """Complete with retry logic"""
        
        for attempt in range(max_retries):
            try:
                return await self.complete(messages, config, user_id)
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                
                # Exponential backoff
                wait_time = 2 ** attempt
                logger.warning(
                    "LLM completion failed, retrying",
                    attempt=attempt + 1,
                    wait_time=wait_time,
                    error=str(e),
                )
                await asyncio.sleep(wait_time)
        
        raise Exception("Max retries exceeded")


# Singleton instance
llm_service = LLMService()
