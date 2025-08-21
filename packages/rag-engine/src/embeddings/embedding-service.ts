// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Embedding service for generating vector embeddings
 */

import { EmbeddingConfig, EmbeddingResult } from '../core/types';
import { OpenAIEmbeddings } from './openai-embeddings';
import { LRUCache } from '../utils/lru-cache';
import { EMBEDDING_CACHE_SIZE } from '../core/config';

export class EmbeddingService {
  private config: EmbeddingConfig;
  private provider: any;
  private cache: LRUCache<string, EmbeddingResult>;

  constructor(config: EmbeddingConfig) {
    this.config = config;
    this.cache = new LRUCache<string, EmbeddingResult>(EMBEDDING_CACHE_SIZE);
    
    // Initialize provider based on config
    switch (config.provider) {
      case 'openai':
        this.provider = new OpenAIEmbeddings(config);
        break;
      case 'cohere':
        throw new Error('Cohere embeddings not yet implemented');
      case 'local':
        throw new Error('Local embeddings not yet implemented');
      default:
        throw new Error(`Unknown embedding provider: ${config.provider}`);
    }
  }

  /**
   * Initialize the embedding service
   */
  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<EmbeddingResult> {
    // Check cache first
    const cached = this.cache.get(text);
    if (cached) {
      return cached;
    }

    // Generate embedding
    const result = await this.provider.embed(text);
    
    // Cache the result
    this.cache.set(text, result);
    
    return result;
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const cached = this.cache.get(texts[i]);
      if (cached) {
        results[i] = cached;
      } else {
        uncachedTexts.push(texts[i]);
        uncachedIndices.push(i);
      }
    }

    // Batch embed uncached texts
    if (uncachedTexts.length > 0) {
      const batchResults = await this.provider.embedBatch(uncachedTexts);
      
      // Place results in correct positions and cache them
      for (let i = 0; i < uncachedTexts.length; i++) {
        const originalIndex = uncachedIndices[i];
        results[originalIndex] = batchResults[i];
        this.cache.set(uncachedTexts[i], batchResults[i]);
      }
    }

    return results;
  }

  /**
   * Calculate similarity between two embeddings
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Get embedding dimension
   */
  getDimension(): number {
    return this.config.dimensions;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    return this.cache.getStats();
  }
}
