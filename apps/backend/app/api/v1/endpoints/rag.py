# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
RAG Engine API endpoints
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user, get_db
from app.models.user import User
# Lazy import to avoid startup issues
# from app.services.rag_service import RAGService
from app.schemas.rag import (
    ContextBasketRequest,
    ContextBasketResponse,
    RAGTemplate,
    RAGTemplateCreate,
    RAGTemplateUpdate,
    RAGSearchRequest,
    RAGSearchResponse,
    IngestRequest,
    IngestResponse,
    IngestProgress
)

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

# Initialize RAG service lazily
_rag_service = None

def get_rag_service():
    global _rag_service
    if _rag_service is None:
        # Import here to avoid startup issues
        from app.services.rag_service import RAGService
        _rag_service = RAGService()
    return _rag_service

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
        get_rag_service().ingest_documents,
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
    result = await get_rag_service().ingest_file(
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
    
    result = await get_rag_service().search(
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
    stats = await get_rag_service().get_stats(current_user.id)
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
    await get_rag_service().delete_document(document_id, current_user.id)
    return {"status": "deleted", "document_id": document_id}

@router.delete("/clear")
async def clear_all_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Clear all documents for the current user
    """
    await get_rag_service().clear_user_documents(current_user.id)
    return {"status": "cleared", "message": "All documents deleted"}

@router.get("/sources")
async def list_sources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    List all document sources for the current user
    """
    sources = await get_rag_service().list_sources(current_user.id)
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
        get_rag_service().reindex_user_documents,
        current_user.id
    )
    
    return {
        "status": "reindexing_started",
        "message": "Document reindexing started in background"
    }

@router.post("/context-basket", response_model=ContextBasketResponse)
async def save_context_basket(
    request: ContextBasketRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ContextBasketResponse:
    """
    Save or use a context basket for agent execution
    """
    try:
        # Validate chunks belong to user
        chunks = await get_rag_service().get_chunks_by_ids(
            request.selected_chunks,
            current_user.id
        )
        
        if len(chunks) != len(request.selected_chunks):
            raise HTTPException(
                status_code=404,
                detail="One or more chunks not found"
            )
        
        # Calculate total tokens
        total_tokens = sum(len(chunk.content) // 4 for chunk in chunks)
        
        # Save context configuration
        context_id = await get_rag_service().save_context_basket(
            user_id=current_user.id,
            query=request.query,
            chunks=chunks,
            agent_id=request.agent_id,
            custom_prompts=request.custom_prompts
        )
        
        return ContextBasketResponse(
            success=True,
            message="Context basket saved successfully",
            context_id=context_id,
            total_tokens=total_tokens
        )
    except Exception as e:
        return ContextBasketResponse(
            success=False,
            message=f"Failed to save context basket: {str(e)}"
        )

@router.get("/templates", response_model=List[RAGTemplate])
async def list_templates(
    agent_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[RAGTemplate]:
    """
    List all RAG templates for the current user
    """
    templates = await get_rag_service().list_templates(
        user_id=current_user.id,
        agent_id=agent_id
    )
    return templates

@router.post("/templates", response_model=RAGTemplate)
async def create_template(
    template: RAGTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RAGTemplate:
    """
    Create a new RAG template
    """
    created_template = await get_rag_service().create_template(
        user_id=current_user.id,
        template=template
    )
    return created_template

@router.get("/templates/{template_id}", response_model=RAGTemplate)
async def get_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RAGTemplate:
    """
    Get a specific RAG template
    """
    template = await get_rag_service().get_template(
        template_id=template_id,
        user_id=current_user.id
    )
    if not template:
        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )
    return template

@router.put("/templates/{template_id}", response_model=RAGTemplate)
async def update_template(
    template_id: str,
    update: RAGTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RAGTemplate:
    """
    Update a RAG template
    """
    updated_template = await get_rag_service().update_template(
        template_id=template_id,
        user_id=current_user.id,
        update=update
    )
    if not updated_template:
        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )
    return updated_template

@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Delete a RAG template
    """
    success = await get_rag_service().delete_template(
        template_id=template_id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )
    return {"status": "deleted", "template_id": template_id}

@router.get("/ingestion/status/{document_id}", response_model=IngestProgress)
async def get_ingestion_status(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> IngestProgress:
    """
    Get the status of a document ingestion
    """
    status = await get_rag_service().get_ingestion_status(
        document_id=document_id,
        user_id=current_user.id
    )
    if not status:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    return status