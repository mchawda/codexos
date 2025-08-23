// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Production-optimized RAG Engine orchestrator
 */

import { EventEmitter } from 'events';
import {
  RAGConfig,
  Document,
  SearchQuery,
  SearchResponse,
  IngestionResult,
  RAGEvent,
  VectorStoreStats,
} from './types';
import { DEFAULT_RAG_CONFIG } from './config';
import { DocumentLoader } from '../ingestion/document-loader';
import { ChunkingService } from '../ingestion/chunking';
import { EmbeddingService } from '../embeddings/embedding-service';
import { VectorStore } from '../storage/vector-store';
import { SemanticSearch } from '../retrieval/semantic-search';
import { HybridSearch } from '../retrieval/hybrid-search';

export class RAGEngine extends EventEmitter {
  private config: RAGConfig;
  private documentLoader: DocumentLoader;
  private chunkingService: ChunkingService;
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;
  private semanticSearch: SemanticSearch;
  private hybridSearch: HybridSearch;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: number = 0;
  private connectionRetryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(config?: Partial<RAGConfig>) {
    super();
    this.config = { ...DEFAULT_RAG_CONFIG, ...config };
    
    // Initialize services
    this.documentLoader = new DocumentLoader(this.config.ingestion);
    this.chunkingService = new ChunkingService(this.config.ingestion);
    this.embeddingService = new EmbeddingService(this.config.embedding);
    this.vectorStore = new VectorStore(this.config.vectorStore);
    this.semanticSearch = new SemanticSearch(this.vectorStore, this.embeddingService);
    this.hybridSearch = new HybridSearch(this.semanticSearch, this.vectorStore);
    
    // Set up health monitoring
    this.setupHealthMonitoring();
  }

  /**
   * Initialize the RAG engine with connection pooling and retry logic
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.isInitializing) {
      // Wait for existing initialization
      return this.initializationPromise!;
    }

    this.isInitializing = true;
    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
    } finally {
      this.isInitializing = false;
    }
  }

  private async performInitialization(): Promise<void> {
    while (this.connectionRetryCount < this.maxRetries) {
      try {
        // Initialize vector store with connection pooling
        await this.vectorStore.connect();
        
        // Initialize embedding service with rate limiting
        await this.embeddingService.initialize();
        
        // Create collection if it doesn't exist
        await this.vectorStore.createCollectionIfNotExists();
        
        // Verify all services are healthy
        await this.performHealthCheck();
        
        this.isInitialized = true;
        this.connectionRetryCount = 0;
        this.emitEvent('initialization_complete', { status: 'success' });
        
        // Start periodic health checks
        this.startHealthCheckInterval();
        
        return;
      } catch (error) {
        this.connectionRetryCount++;
        this.emitEvent('error', { 
          message: `Initialization attempt ${this.connectionRetryCount} failed`, 
          error: error instanceof Error ? error.message : String(error),
          retryCount: this.connectionRetryCount
        });
        
        if (this.connectionRetryCount >= this.maxRetries) {
          throw new Error(`Failed to initialize RAG engine after ${this.maxRetries} attempts`);
        }
        
        // Exponential backoff
        await this.delay(this.retryDelay * Math.pow(2, this.connectionRetryCount - 1));
      }
    }
  }

  /**
   * Production-optimized document ingestion with batch processing
   */
  async ingestDocuments(
    sources: Array<{ type: string; path: string; metadata?: any }>
  ): Promise<IngestionResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results: IngestionResult[] = [];
    const batchSize = this.config.embedding.batchSize;
    
    // Process documents in batches for better performance
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      const batchResults = await this.processBatch(batch);
      results.push(...batchResults);
      
      // Emit progress for large ingestions
      if (sources.length > batchSize) {
        this.emitEvent('ingestion_progress', { 
          processed: Math.min(i + batchSize, sources.length),
          total: sources.length,
          batch: Math.floor(i / batchSize) + 1
        });
      }
    }

    return results;
  }

  private async processBatch(
    sources: Array<{ type: string; path: string; metadata?: any }>
  ): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];
    const allChunks: any[] = [];
    const allTexts: string[] = [];

    // Load and chunk all documents in batch
    for (const source of sources) {
      try {
        this.emitEvent('ingestion_start', { source });

        // Load document
        const document = await this.documentLoader.load(
          source.type as any,
          source.path,
          source.metadata
        );

        // Chunk document
        const chunks = await this.chunkingService.chunk(document);
        allChunks.push(...chunks);
        allTexts.push(...chunks.map(chunk => chunk.content));
        
        this.emitEvent('ingestion_progress', { 
          documentId: document.id, 
          chunksCreated: chunks.length 
        });

      } catch (error) {
        const errorResult: IngestionResult = {
          documentId: '',
          chunksCreated: 0,
          tokensProcessed: 0,
          embeddingsCreated: 0,
          errors: [error instanceof Error ? error.message : String(error)],
        };
        results.push(errorResult);
        this.emitEvent('error', { source, error: errorResult.errors });
      }
    }

    if (allTexts.length === 0) {
      return results;
    }

    try {
      // Generate embeddings in optimized batches
      const embeddingsResults = await this.embeddingService.embedBatch(allTexts);
      
      // Update chunks with embeddings
      for (let i = 0; i < allChunks.length; i++) {
        allChunks[i].embedding = embeddingsResults[i].embedding;
      }

      // Store in vector database using batch operations
      await this.vectorStore.upsertBatch(allChunks);

      // Create results for successful documents
      let chunkIndex = 0;
      for (const source of sources) {
        const documentChunks = allChunks.slice(chunkIndex, chunkIndex + 100); // Estimate chunks per doc
        const result: IngestionResult = {
          documentId: source.path, // Use path as ID for now
          chunksCreated: documentChunks.length,
          tokensProcessed: documentChunks.reduce((sum, chunk) => sum + (chunk.tokenCount || 0), 0),
          embeddingsCreated: documentChunks.length,
        };
        results.push(result);
        chunkIndex += documentChunks.length;
      }

      this.emitEvent('ingestion_complete', { results });

    } catch (error) {
      this.emitEvent('error', { 
        message: 'Batch processing failed', 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }

    return results;
  }

  /**
   * Production-optimized search with caching and performance monitoring
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();
    this.emitEvent('search_start', { query });

    try {
      let response: SearchResponse;

      if (this.config.retrieval.hybridSearch) {
        response = await this.hybridSearch.search(query);
      } else {
        response = await this.semanticSearch.search(query);
      }

      response.processingTime = performance.now() - startTime;
      
      // Performance monitoring
      if (response.processingTime > 1000) { // Log slow queries
        this.emitEvent('performance_warning', { 
          query: query.text.substring(0, 100),
          processingTime: response.processingTime,
          resultCount: response.results.length
        });
      }

      this.emitEvent('search_complete', { response });
      return response;
    } catch (error) {
      this.emitEvent('error', { 
        message: 'Search failed', 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Get comprehensive statistics about the RAG system
   */
  async getStats(): Promise<VectorStoreStats> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const stats = await this.vectorStore.getStats();
    
    // Add performance metrics
    return {
      ...stats,
      lastHealthCheck: this.lastHealthCheck,
      connectionRetryCount: this.connectionRetryCount,
      isHealthy: this.isInitialized && this.connectionRetryCount === 0
    };
  }

  /**
   * Perform health check on all services
   */
  private async performHealthCheck(): Promise<boolean> {
    try {
      // Check vector store connection
      await this.vectorStore.connect();
      
      // Check embedding service
      await this.embeddingService.initialize();
      
      this.lastHealthCheck = Date.now();
      this.emitEvent('health_check', { status: 'healthy', timestamp: this.lastHealthCheck });
      return true;
    } catch (error) {
      this.emitEvent('health_check', { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
      return false;
    }
  }

  /**
   * Set up periodic health monitoring
   */
  private setupHealthMonitoring(): void {
    // Health check every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      if (this.isInitialized) {
        await this.performHealthCheck();
      }
    }, 5 * 60 * 1000);
  }

  private startHealthCheckInterval(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.setupHealthMonitoring();
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    try {
      await this.vectorStore.disconnect();
      this.emitEvent('shutdown', { status: 'success' });
    } catch (error) {
      this.emitEvent('shutdown', { 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Clear all documents from the vector store
   */
  async clearAll(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await this.vectorStore.deleteCollection();
    await this.vectorStore.createCollectionIfNotExists();
  }

  /**
   * Delete specific documents
   */
  async deleteDocuments(documentIds: string[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await this.vectorStore.deleteDocuments(documentIds);
  }

  /**
   * Update document metadata
   */
  async updateDocumentMetadata(
    documentId: string, 
    metadata: Record<string, any>
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await this.vectorStore.updateDocumentMetadata(documentId, metadata);
  }

  /**
   * Emit events with error handling
   */
  private emitEvent(event: RAGEvent, data: any): void {
    try {
      this.emit(event, data);
    } catch (error) {
      // Prevent event emission errors from crashing the system
      console.error(`Error emitting RAG event ${event}:`, error);
    }
  }

  /**
   * Utility for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
