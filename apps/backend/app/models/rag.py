# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
RAG-related database models
"""

from uuid import uuid4

from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime, Float, Index
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base, TimestampMixin

class Document(Base, TimestampMixin):
    """Document model for RAG system"""
    __tablename__ = "documents"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String(255), unique=True, index=True)  # External document ID
    name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)  # pdf, github, web, text
    source_url = Column(String(500))
    metadata = Column(JSON, default={})
    chunk_count = Column(Integer, default=0)
    token_count = Column(Integer, default=0)
    status = Column(String(50), default="pending")  # pending, processing, ready, error
    error_message = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_document_user_status', 'user_id', 'status'),
        Index('idx_document_source_type', 'source_type'),
    )

class DocumentChunk(Base, TimestampMixin):
    """Document chunk model for vector storage"""
    __tablename__ = "document_chunks"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    document_id = Column(PGUUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding_id = Column(String(255))  # ID in vector store
    metadata = Column(JSON, default={})
    token_count = Column(Integer)
    
    # Relationships
    document = relationship("Document", back_populates="chunks")
    
    # Indexes
    __table_args__ = (
        Index('idx_chunk_document', 'document_id', 'chunk_index'),
        Index('idx_chunk_embedding', 'embedding_id'),
    )

class SearchHistory(Base, TimestampMixin):
    """Search history for analytics and caching"""
    __tablename__ = "search_history"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query = Column(Text, nullable=False)
    filter_params = Column(JSON, default={})
    result_count = Column(Integer)
    avg_score = Column(Float)
    processing_time = Column(Integer)  # milliseconds
    selected_results = Column(JSON, default=[])  # Track which results user clicked
    
    # Relationships
    user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_search_user_created', 'user_id', 'created_at'),
    )
