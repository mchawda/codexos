"""
RAG Engine API endpoints
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.rag_service import RAGService

router = APIRouter()

# Pydantic models for requests/responses
class DocumentIngestionRequest(BaseModel):
    sources: List[Dict[str, Any]]
    
class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 10
    filter: Optional[Dict[str, Any]] = None
    score_threshold: Optional[float] = None
    hybrid_alpha: Optional[float] = 0.5
    
class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_results: int
    query: str
    processing_time: int
    
class RAGStats(BaseModel):
    total_documents: int
    total_chunks: int
    total_embeddings: int
    index_size: int
    last_updated: str

# Initialize RAG service
rag_service = RAGService()

@router.post("/ingest")
async def ingest_documents(
    request: DocumentIngestionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Ingest documents into the RAG system
    """
    # Add ingestion task to background
    background_tasks.add_task(
        rag_service.ingest_documents,
        request.sources,
        current_user.id
    )
    
    return {
        "status": "ingestion_started",
        "message": f"Started ingesting {len(request.sources)} documents",
        "sources": request.sources
    }

@router.post("/ingest/file")
async def ingest_file(
    file: UploadFile = File(...),
    metadata: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Ingest a single file
    """
    # Validate file type
    allowed_types = ['.pdf', '.txt', '.md', '.json']
    file_ext = file.filename.split('.')[-1].lower()
    if f".{file_ext}" not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type .{file_ext} not supported"
        )
    
    # Save file temporarily
    file_content = await file.read()
    result = await rag_service.ingest_file(
        file_content,
        file.filename,
        file_ext,
        metadata,
        current_user.id
    )
    
    return result

@router.post("/search", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> SearchResponse:
    """
    Search for relevant documents
    """
    # Add user filter
    if request.filter is None:
        request.filter = {}
    request.filter['user_id'] = current_user.id
    
    result = await rag_service.search(
        request.query,
        request.top_k,
        request.filter,
        request.score_threshold,
        request.hybrid_alpha
    )
    
    return SearchResponse(**result)

@router.get("/stats", response_model=RAGStats)
async def get_rag_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RAGStats:
    """
    Get RAG system statistics
    """
    stats = await rag_service.get_stats(current_user.id)
    return RAGStats(**stats)

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Delete a specific document
    """
    await rag_service.delete_document(document_id, current_user.id)
    return {"status": "deleted", "document_id": document_id}

@router.delete("/clear")
async def clear_all_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Clear all documents for the current user
    """
    await rag_service.clear_user_documents(current_user.id)
    return {"status": "cleared", "message": "All documents deleted"}

@router.get("/sources")
async def list_sources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    List all document sources for the current user
    """
    sources = await rag_service.list_sources(current_user.id)
    return {"sources": sources}

@router.post("/reindex")
async def reindex_documents(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Reindex all documents (regenerate embeddings)
    """
    background_tasks.add_task(
        rag_service.reindex_user_documents,
        current_user.id
    )
    
    return {
        "status": "reindexing_started",
        "message": "Document reindexing started in background"
    }