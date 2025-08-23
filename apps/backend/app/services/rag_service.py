# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
RAG Service for document ingestion and search
"""

import os
import json
import tempfile
from typing import List, Dict, Any, Optional
from datetime import datetime
import chromadb

class RAGService:
    def __init__(self):
        # Initialize ChromaDB client with external container
        chroma_host = os.getenv("CHROMA_HOST", "localhost")
        chroma_port = os.getenv("CHROMA_PORT", "8000")
        
        try:
            self.client = chromadb.HttpClient(
                host=chroma_host,
                port=chroma_port
            )
            
            # Create or get collection
            self.collection = self.client.get_or_create_collection(
                name="codexos_documents",
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            # Fallback to local client if external connection fails
            self.client = chromadb.PersistentClient(path="./chroma_db")
            self.collection = self.client.get_or_create_collection(
                name="codexos_documents",
                metadata={"hnsw:space": "cosine"}
            )
    
    async def ingest_documents(
        self, 
        sources: List[Dict[str, Any]], 
        user_id: int
    ) -> List[Dict[str, Any]]:
        """
        Ingest multiple documents
        """
        results = []
        
        for source in sources:
            try:
                result = await self._ingest_single_source(source, user_id)
                results.append(result)
            except Exception as e:
                results.append({
                    "source": source,
                    "status": "error",
                    "error": str(e)
                })
        
        return results
    
    async def _ingest_single_source(
        self, 
        source: Dict[str, Any], 
        user_id: int
    ) -> Dict[str, Any]:
        """
        Ingest a single source
        """
        source_type = source.get("type")
        path = source.get("path")
        metadata = source.get("metadata", {})
        
        # Add user_id to metadata
        metadata["user_id"] = user_id
        metadata["source_type"] = source_type
        metadata["ingested_at"] = datetime.utcnow().isoformat()
        
        if source_type == "text":
            content = source.get("content", "")
            doc_id = f"text_{user_id}_{hash(content)}"
            
            # Simple chunking for demo
            chunks = self._chunk_text(content)
            
            # Add to ChromaDB
            self.collection.add(
                documents=chunks,
                metadatas=[{**metadata, "chunk_index": i} for i in range(len(chunks))],
                ids=[f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
            )
            
            return {
                "document_id": doc_id,
                "chunks_created": len(chunks),
                "status": "success"
            }
        
        # Add more source types as needed
        raise ValueError(f"Unsupported source type: {source_type}")
    
    async def ingest_file(
        self,
        file_content: bytes,
        filename: str,
        file_type: str,
        metadata: Optional[str],
        user_id: int
    ) -> Dict[str, Any]:
        """
        Ingest a file
        """
        # Parse metadata if provided
        file_metadata = {}
        if metadata:
            try:
                file_metadata = json.loads(metadata)
            except:
                pass
        
        file_metadata.update({
            "filename": filename,
            "file_type": file_type,
            "user_id": user_id,
            "ingested_at": datetime.utcnow().isoformat()
        })
        
        # Process based on file type
        if file_type in ["txt", "md"]:
            content = file_content.decode('utf-8')
            doc_id = f"file_{user_id}_{filename}"
            
            chunks = self._chunk_text(content)
            
            self.collection.add(
                documents=chunks,
                metadatas=[{**file_metadata, "chunk_index": i} for i in range(len(chunks))],
                ids=[f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
            )
            
            return {
                "document_id": doc_id,
                "filename": filename,
                "chunks_created": len(chunks),
                "status": "success"
            }
        
        # Add PDF processing, etc.
        raise ValueError(f"File type {file_type} processing not implemented")
    
    async def search(
        self,
        query: str,
        top_k: int = 10,
        filter: Optional[Dict[str, Any]] = None,
        score_threshold: Optional[float] = None,
        hybrid_alpha: Optional[float] = 0.5
    ) -> Dict[str, Any]:
        """
        Search documents
        """
        import time
        start_time = time.time()
        
        # Query ChromaDB
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k,
            where=filter
        )
        
        # Format results
        search_results = []
        for i in range(len(results['ids'][0])):
            score = 1 - results['distances'][0][i]  # Convert distance to similarity
            
            if score_threshold and score < score_threshold:
                continue
            
            search_results.append({
                "chunk_id": results['ids'][0][i],
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "score": score
            })
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return {
            "results": search_results,
            "total_results": len(search_results),
            "query": query,
            "processing_time": processing_time
        }
    
    async def get_stats(self, user_id: int) -> Dict[str, Any]:
        """
        Get RAG statistics for a user
        """
        # Get user documents count
        user_docs = self.collection.get(
            where={"user_id": user_id}
        )
        
        return {
            "total_documents": len(set(doc['metadatas'][0].get('document_id', '') 
                                     for doc in user_docs if doc)),
            "total_chunks": len(user_docs['ids']),
            "total_embeddings": len(user_docs['ids']),
            "index_size": 0,  # ChromaDB doesn't expose this
            "last_updated": datetime.utcnow().isoformat()
        }
    
    async def delete_document(self, document_id: str, user_id: int):
        """
        Delete a document
        """
        # Delete all chunks for this document
        self.collection.delete(
            where={
                "document_id": document_id,
                "user_id": user_id
            }
        )
    
    async def clear_user_documents(self, user_id: int):
        """
        Clear all documents for a user
        """
        self.collection.delete(
            where={"user_id": user_id}
        )
    
    async def list_sources(self, user_id: int) -> List[Dict[str, Any]]:
        """
        List all document sources for a user
        """
        results = self.collection.get(
            where={"user_id": user_id}
        )
        
        # Extract unique sources
        sources = {}
        for i, metadata in enumerate(results['metadatas']):
            doc_id = metadata.get('document_id', f"unknown_{i}")
            if doc_id not in sources:
                sources[doc_id] = {
                    "document_id": doc_id,
                    "filename": metadata.get('filename'),
                    "source_type": metadata.get('source_type'),
                    "ingested_at": metadata.get('ingested_at'),
                    "chunk_count": 0
                }
            sources[doc_id]['chunk_count'] += 1
        
        return list(sources.values())
    
    async def reindex_user_documents(self, user_id: int):
        """
        Reindex all documents for a user
        """
        # In a real implementation, this would:
        # 1. Get all documents
        # 2. Regenerate embeddings
        # 3. Update in vector store
        pass
    
    def _chunk_text(self, text: str, chunk_size: int = 1000) -> List[str]:
        """
        Simple text chunking
        """
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1
            
            if current_size >= chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
