/**
 * Vector store abstraction for different providers
 */

import { 
  VectorStoreConfig, 
  VectorStoreStats, 
  DocumentChunk,
  SearchFilter,
} from '../core/types';
import { ChromaClient } from './chroma-client';

export class VectorStore {
  private config: VectorStoreConfig;
  private client: any;

  constructor(config: VectorStoreConfig) {
    this.config = config;
    
    // Initialize client based on provider
    switch (config.provider) {
      case 'chroma':
        this.client = new ChromaClient(config);
        break;
      case 'pinecone':
        throw new Error('Pinecone not yet implemented');
      case 'weaviate':
        throw new Error('Weaviate not yet implemented');
      default:
        throw new Error(`Unknown vector store provider: ${config.provider}`);
    }
  }

  /**
   * Connect to the vector store
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Disconnect from the vector store
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Create collection if it doesn't exist
   */
  async createCollectionIfNotExists(): Promise<void> {
    await this.client.createCollectionIfNotExists();
  }

  /**
   * Delete collection
   */
  async deleteCollection(): Promise<void> {
    await this.client.deleteCollection();
  }

  /**
   * Upsert document chunk
   */
  async upsert(chunk: DocumentChunk): Promise<void> {
    await this.client.upsert(chunk);
  }

  /**
   * Upsert multiple chunks in batch
   */
  async upsertBatch(chunks: DocumentChunk[]): Promise<void> {
    await this.client.upsertBatch(chunks);
  }

  /**
   * Search for similar chunks
   */
  async search(
    embedding: number[],
    topK: number,
    filter?: SearchFilter
  ): Promise<DocumentChunk[]> {
    return await this.client.search(embedding, topK, filter);
  }

  /**
   * Keyword search
   */
  async keywordSearch(
    query: string,
    topK: number,
    filter?: SearchFilter
  ): Promise<DocumentChunk[]> {
    return await this.client.keywordSearch(query, topK, filter);
  }

  /**
   * Get chunk by ID
   */
  async getById(id: string): Promise<DocumentChunk | null> {
    return await this.client.getById(id);
  }

  /**
   * Delete chunks by document ID
   */
  async deleteByMetadata(metadata: Record<string, any>): Promise<void> {
    await this.client.deleteByMetadata(metadata);
  }

  /**
   * Get statistics about the vector store
   */
  async getStats(): Promise<VectorStoreStats> {
    return await this.client.getStats();
  }

  /**
   * Count chunks matching filter
   */
  async count(filter?: SearchFilter): Promise<number> {
    return await this.client.count(filter);
  }
}
