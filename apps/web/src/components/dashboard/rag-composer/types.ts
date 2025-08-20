/**
 * Types for the RAG Composer component
 */

export interface RAGChunk {
  id: string;
  content: string;
  documentId: string;
  metadata: {
    source: string;
    title: string;
    chunkIndex: number;
    score?: number;
    tags?: string[];
    createdAt?: string;
  };
  embedding?: number[];
  selected?: boolean;
  pinned?: boolean;
}

export interface ContextBasketItem {
  chunkId: string;
  chunk: RAGChunk;
  order: number;
  customPrompt?: string;
}

export interface RAGTemplate {
  id: string;
  name: string;
  description?: string;
  chunks: ContextBasketItem[];
  filters?: RAGFilter;
  createdAt: string;
  updatedAt: string;
  agentId?: string;
}

export interface RAGFilter {
  sources?: string[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  scoreThreshold?: number;
}

export interface RAGSearchParams {
  query: string;
  filters?: RAGFilter;
  topK?: number;
  hybridAlpha?: number;
  includeEmbeddings?: boolean;
}

export interface IngestProgress {
  documentId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'embedding' | 'indexing' | 'complete' | 'error';
  progress: number;
  chunksCreated?: number;
  error?: string;
}
