// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Default configuration for RAG Engine
 */

import { RAGConfig } from './types';

export const DEFAULT_RAG_CONFIG: RAGConfig = {
  ingestion: {
    chunkSize: 1000,
    chunkOverlap: 200,
    splitMethod: 'recursive',
    preserveFormatting: true,
    extractMetadata: true,
  },
  embedding: {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    batchSize: 100,
  },
  vectorStore: {
    provider: 'chroma',
    connectionUrl: process.env.CHROMA_URL || 'http://localhost:8000',
    collectionName: 'codexos_documents',
    distanceMetric: 'cosine',
  },
  retrieval: {
    defaultTopK: 10,
    rerank: true,
    rerankModel: 'cohere-rerank-english-v2.0',
    hybridSearch: true,
    cacheResults: true,
    cacheTTL: 3600, // 1 hour
  },
};

export const SUPPORTED_FILE_TYPES = [
  '.pdf',
  '.txt',
  '.md',
  '.mdx',
  '.json',
  '.yaml',
  '.yml',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.java',
  '.cpp',
  '.c',
  '.h',
  '.hpp',
  '.cs',
  '.go',
  '.rs',
  '.rb',
  '.php',
  '.swift',
  '.kt',
  '.scala',
  '.r',
  '.sql',
  '.sh',
  '.bash',
  '.zsh',
  '.ps1',
  '.dockerfile',
  '.yaml',
  '.toml',
  '.xml',
  '.html',
  '.css',
  '.scss',
  '.sass',
  '.less',
];

export const MAX_CHUNK_SIZE = 4000; // tokens
export const MIN_CHUNK_SIZE = 100; // tokens
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_BATCH_SIZE = 1000; // documents
export const EMBEDDING_CACHE_SIZE = 10000; // number of embeddings to cache in memory
