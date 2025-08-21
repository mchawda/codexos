// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Main RAG Engine orchestrator
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
  }

  /**
   * Initialize the RAG engine and connect to services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize vector store
      await this.vectorStore.connect();
      
      // Initialize embedding service
      await this.embeddingService.initialize();
      
      // Create collection if it doesn't exist
      await this.vectorStore.createCollectionIfNotExists();
      
      this.isInitialized = true;
      this.emitEvent('initialization_complete', { status: 'success' });
    } catch (error) {
      this.emitEvent('error', { 
        message: 'Failed to initialize RAG engine', 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Ingest documents into the RAG system
   */
  async ingestDocuments(
    sources: Array<{ type: string; path: string; metadata?: any }>
  ): Promise<IngestionResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results: IngestionResult[] = [];

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
        
        this.emitEvent('ingestion_progress', { 
          documentId: document.id, 
          chunksCreated: chunks.length 
        });

        // Generate embeddings
        const embeddingsResults = await this.embeddingService.embedBatch(
          chunks.map(chunk => chunk.content)
        );

        // Store in vector database
        for (let i = 0; i < chunks.length; i++) {
          chunks[i].embedding = embeddingsResults[i].embedding;
          await this.vectorStore.upsert(chunks[i]);
        }

        const result: IngestionResult = {
          documentId: document.id,
          chunksCreated: chunks.length,
          tokensProcessed: chunks.reduce((sum, chunk) => sum + (chunk.tokenCount || 0), 0),
          embeddingsCreated: embeddingsResults.length,
        };

        results.push(result);
        this.emitEvent('ingestion_complete', { result });

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

    return results;
  }

  /**
   * Search for relevant content
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    this.emitEvent('search_start', { query });

    try {
      let response: SearchResponse;

      if (this.config.retrieval.hybridSearch) {
        response = await this.hybridSearch.search(query);
      } else {
        response = await this.semanticSearch.search(query);
      }

      response.processingTime = Date.now() - startTime;
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
   * Get statistics about the vector store
   */
  async getStats(): Promise<VectorStoreStats> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await this.vectorStore.getStats();
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

    for (const documentId of documentIds) {
      await this.vectorStore.deleteByMetadata({ documentId });
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RAGConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize services with new config
    if (config.ingestion) {
      this.documentLoader = new DocumentLoader(this.config.ingestion);
      this.chunkingService = new ChunkingService(this.config.ingestion);
    }
    
    if (config.embedding) {
      this.embeddingService = new EmbeddingService(this.config.embedding);
    }
    
    if (config.vectorStore) {
      this.vectorStore = new VectorStore(this.config.vectorStore);
      this.semanticSearch = new SemanticSearch(this.vectorStore, this.embeddingService);
      this.hybridSearch = new HybridSearch(this.semanticSearch, this.vectorStore);
      this.isInitialized = false;
    }
  }

  /**
   * Emit RAG events
   */
  private emitEvent(type: RAGEvent['type'], data: any): void {
    const event: RAGEvent = {
      type,
      data,
      timestamp: new Date(),
    };
    this.emit('rag-event', event);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.vectorStore.disconnect();
    this.removeAllListeners();
    this.isInitialized = false;
  }
}
