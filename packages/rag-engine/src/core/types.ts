/**
 * Core types for the RAG Engine
 */

import { z } from 'zod';

// Document types
export const DocumentSourceSchema = z.enum(['pdf', 'github', 'web', 'text', 'markdown']);
export type DocumentSource = z.infer<typeof DocumentSourceSchema>;

export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
  chunks?: DocumentChunk[];
}

export interface DocumentMetadata {
  source: DocumentSource;
  title?: string;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
  url?: string;
  filePath?: string;
  language?: string;
  tags?: string[];
  [key: string]: any;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: ChunkMetadata;
  embedding?: number[];
  tokenCount?: number;
}

export interface ChunkMetadata extends DocumentMetadata {
  chunkIndex: number;
  startOffset: number;
  endOffset: number;
  overlapWithPrevious?: number;
  overlapWithNext?: number;
}

// Ingestion types
export interface IngestionConfig {
  chunkSize: number;
  chunkOverlap: number;
  splitMethod: 'recursive' | 'semantic' | 'fixed';
  preserveFormatting: boolean;
  extractMetadata: boolean;
}

export interface IngestionResult {
  documentId: string;
  chunksCreated: number;
  tokensProcessed: number;
  embeddingsCreated: number;
  errors?: string[];
}

// Search types
export interface SearchQuery {
  query: string;
  topK?: number;
  filter?: SearchFilter;
  includeMetadata?: boolean;
  scoreThreshold?: number;
  hybridAlpha?: number; // 0 = pure vector, 1 = pure keyword
}

export interface SearchFilter {
  source?: DocumentSource[];
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  metadata?: Record<string, any>;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  highlights?: string[];
  rerankedScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  query: string;
  processingTime: number;
}

// Embedding types
export interface EmbeddingConfig {
  provider: 'openai' | 'cohere' | 'local';
  model: string;
  dimensions: number;
  batchSize: number;
}

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
  model: string;
}

// Vector store types
export interface VectorStoreConfig {
  provider: 'chroma' | 'pinecone' | 'weaviate';
  connectionUrl: string;
  collectionName: string;
  distanceMetric: 'cosine' | 'euclidean' | 'dot';
}

export interface VectorStoreStats {
  totalDocuments: number;
  totalChunks: number;
  totalEmbeddings: number;
  indexSize: number;
  lastUpdated: Date;
}

// RAG Engine types
export interface RAGConfig {
  ingestion: IngestionConfig;
  embedding: EmbeddingConfig;
  vectorStore: VectorStoreConfig;
  retrieval: RetrievalConfig;
}

export interface RetrievalConfig {
  defaultTopK: number;
  rerank: boolean;
  rerankModel?: string;
  hybridSearch: boolean;
  cacheResults: boolean;
  cacheTTL?: number;
}

// Event types for streaming
export interface RAGEvent {
  type: 'ingestion_start' | 'ingestion_progress' | 'ingestion_complete' | 
        'embedding_start' | 'embedding_progress' | 'embedding_complete' |
        'search_start' | 'search_complete' | 'error';
  data: any;
  timestamp: Date;
}
