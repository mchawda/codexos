# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Schemas for RAG-related operations
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ChunkMetadata(BaseModel):
    """Metadata for a document chunk"""
    source: str
    title: str
    chunk_index: int
    score: Optional[float] = None
    tags: Optional[List[str]] = None
    created_at: Optional[datetime] = None


class RAGChunk(BaseModel):
    """Individual chunk of RAG content"""
    id: str
    content: str
    document_id: str
    metadata: ChunkMetadata
    embedding: Optional[List[float]] = None
    selected: Optional[bool] = False
    pinned: Optional[bool] = False


class ContextBasketItem(BaseModel):
    """Item in the context basket"""
    chunk_id: str
    chunk: RAGChunk
    order: int
    custom_prompt: Optional[str] = None


class RAGFilter(BaseModel):
    """Filters for RAG search"""
    sources: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    date_range: Optional[Dict[str, datetime]] = None
    score_threshold: Optional[float] = None


class RAGSearchRequest(BaseModel):
    """Request for RAG search"""
    query: str
    filters: Optional[RAGFilter] = None
    top_k: Optional[int] = Field(default=10, ge=1, le=100)
    hybrid_alpha: Optional[float] = Field(default=0.7, ge=0, le=1)
    include_embeddings: Optional[bool] = False


class RAGSearchResponse(BaseModel):
    """Response from RAG search"""
    results: List[RAGChunk]
    total_results: int
    query: str
    processing_time: float


class ContextBasketRequest(BaseModel):
    """Request to save/use context basket"""
    query: str
    selected_chunks: List[str]  # chunk IDs
    agent_id: Optional[str] = None
    custom_prompts: Optional[Dict[str, str]] = None  # chunk_id -> custom prompt


class ContextBasketResponse(BaseModel):
    """Response from context basket operation"""
    success: bool
    message: str
    context_id: Optional[str] = None
    total_tokens: Optional[int] = None


class RAGTemplate(BaseModel):
    """RAG template for reusable context configurations"""
    id: str
    name: str
    description: Optional[str] = None
    chunks: List[ContextBasketItem]
    filters: Optional[RAGFilter] = None
    created_at: datetime
    updated_at: datetime
    agent_id: Optional[str] = None
    user_id: str


class RAGTemplateCreate(BaseModel):
    """Create a new RAG template"""
    name: str
    description: Optional[str] = None
    chunks: List[ContextBasketItem]
    filters: Optional[RAGFilter] = None
    agent_id: Optional[str] = None


class RAGTemplateUpdate(BaseModel):
    """Update an existing RAG template"""
    name: Optional[str] = None
    description: Optional[str] = None
    chunks: Optional[List[ContextBasketItem]] = None
    filters: Optional[RAGFilter] = None


class IngestRequest(BaseModel):
    """Request to ingest a document"""
    source_type: str  # 'pdf', 'text', 'github', 'web'
    source_url: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    chunk_size: Optional[int] = Field(default=1000, ge=100, le=10000)
    chunk_overlap: Optional[int] = Field(default=200, ge=0, le=500)


class IngestProgress(BaseModel):
    """Progress of document ingestion"""
    document_id: str
    file_name: str
    status: str  # 'pending', 'processing', 'embedding', 'indexing', 'complete', 'error'
    progress: int  # 0-100
    chunks_created: Optional[int] = None
    error: Optional[str] = None


class IngestResponse(BaseModel):
    """Response from document ingestion"""
    document_id: str
    status: str
    message: str
    chunks_created: Optional[int] = None
    total_tokens: Optional[int] = None
