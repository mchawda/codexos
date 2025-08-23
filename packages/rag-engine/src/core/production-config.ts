// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Production-optimized configuration for RAG Engine
 */

import { RAGConfig } from './types';

export const PRODUCTION_RAG_CONFIG: RAGConfig = {
  ingestion: {
    chunkSize: 800, // Smaller chunks for better retrieval
    chunkOverlap: 150, // Reduced overlap for efficiency
    splitMethod: 'semantic', // Use semantic splitting for better quality
    preserveFormatting: false, // Disable for performance
    extractMetadata: true,
    maxConcurrentDocuments: 10, // Limit concurrent processing
    batchProcessing: true,
  },
  embedding: {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    batchSize: 200, // Larger batches for better throughput
    rateLimit: {
      requestsPerMinute: 3000, // OpenAI rate limit
      maxConcurrent: 5,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  },
  vectorStore: {
    provider: 'chroma',
    connectionUrl: process.env.CHROMA_URL || 'http://localhost:8000',
    collectionName: 'codexos_documents',
    distanceMetric: 'cosine',
    connectionPool: {
      minConnections: 5,
      maxConnections: 20,
      acquireTimeout: 30000,
      idleTimeout: 60000,
    },
    indexing: {
      autoIndex: true,
      indexType: 'hnsw', // Hierarchical Navigable Small World for better performance
      efConstruction: 200, // Higher values = better quality, slower build
      efSearch: 100, // Higher values = better quality, slower search
    },
  },
  retrieval: {
    defaultTopK: 15, // Increased for better coverage
    rerank: true,
    rerankModel: 'cohere-rerank-english-v2.0',
    hybridSearch: true,
    cacheResults: true,
    cacheTTL: 7200, // 2 hours for production
    searchOptimization: {
      useApproximateSearch: true, // Faster but slightly less accurate
      maxSearchTime: 5000, // 5 second timeout
      parallelSearch: true, // Search multiple collections in parallel
    },
  },
  performance: {
    enableMetrics: true,
    enableProfiling: true,
    slowQueryThreshold: 1000, // Log queries taking > 1 second
    maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
    enableCompression: true,
    compressionLevel: 6, // Balance between size and speed
  },
  monitoring: {
    healthCheckInterval: 300000, // 5 minutes
    metricsCollection: true,
    logLevel: 'info',
    enableTracing: true,
    performanceMonitoring: true,
    errorReporting: true,
  },
  security: {
    enableEncryption: true,
    encryptionAlgorithm: 'AES-256-GCM',
    enableAuditLogging: true,
    maxQueryLength: 10000, // Prevent extremely long queries
    rateLimiting: {
      maxQueriesPerMinute: 100,
      maxIngestionsPerHour: 50,
    },
  },
  scaling: {
    enableHorizontalScaling: true,
    shardingStrategy: 'hash', // Distribute documents across shards
    replicationFactor: 2, // Keep 2 copies of each document
    loadBalancing: true,
    autoScaling: {
      enabled: true,
      minInstances: 2,
      maxInstances: 10,
      scaleUpThreshold: 0.8, // Scale up at 80% CPU
      scaleDownThreshold: 0.3, // Scale down at 30% CPU
    },
  },
};

// Environment-specific overrides
export const getProductionConfig = (): RAGConfig => {
  const config = { ...PRODUCTION_RAG_CONFIG };
  
  // Override with environment variables
  if (process.env.RAG_CHUNK_SIZE) {
    config.ingestion.chunkSize = parseInt(process.env.RAG_CHUNK_SIZE);
  }
  
  if (process.env.RAG_BATCH_SIZE) {
    config.embedding.batchSize = parseInt(process.env.RAG_BATCH_SIZE);
  }
  
  if (process.env.RAG_MAX_CONNECTIONS) {
    config.vectorStore.connectionPool.maxConnections = parseInt(process.env.RAG_MAX_CONNECTIONS);
  }
  
  if (process.env.RAG_CACHE_TTL) {
    config.retrieval.cacheTTL = parseInt(process.env.RAG_CACHE_TTL);
  }
  
  if (process.env.RAG_HEALTH_CHECK_INTERVAL) {
    config.monitoring.healthCheckInterval = parseInt(process.env.RAG_HEALTH_CHECK_INTERVAL);
  }
  
  return config;
};

// Performance tuning presets
export const PERFORMANCE_PRESETS = {
  highThroughput: {
    chunkSize: 600,
    batchSize: 500,
    maxConnections: 50,
    enableCompression: false,
    useApproximateSearch: true,
  },
  highAccuracy: {
    chunkSize: 1000,
    batchSize: 100,
    maxConnections: 10,
    enableCompression: true,
    useApproximateSearch: false,
    efConstruction: 400,
    efSearch: 200,
  },
  balanced: {
    chunkSize: 800,
    batchSize: 200,
    maxConnections: 20,
    enableCompression: true,
    useApproximateSearch: true,
    efConstruction: 200,
    efSearch: 100,
  },
};
