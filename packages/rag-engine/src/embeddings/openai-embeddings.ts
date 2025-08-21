// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * OpenAI embeddings provider
 */

import { OpenAI } from 'openai';
import { EmbeddingConfig, EmbeddingResult } from '../core/types';
import { encoding_for_model } from 'tiktoken';

export class OpenAIEmbeddings {
  private config: EmbeddingConfig;
  private openai: OpenAI;
  private tokenizer: any;

  constructor(config: EmbeddingConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.tokenizer = encoding_for_model('gpt-3.5-turbo');
  }

  /**
   * Initialize the OpenAI embeddings
   */
  async initialize(): Promise<void> {
    // Test API connection
    try {
      await this.embed('test');
    } catch (error) {
      throw new Error(`Failed to initialize OpenAI embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<EmbeddingResult> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.config.model,
        input: text,
      });

      return {
        embedding: response.data[0].embedding,
        tokenCount: this.countTokens(text),
        model: this.config.model,
      };
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    // Process in batches to respect API limits
    for (let i = 0; i < texts.length; i += this.config.batchSize) {
      const batch = texts.slice(i, i + this.config.batchSize);
      
      try {
        const response = await this.openai.embeddings.create({
          model: this.config.model,
          input: batch,
        });

        for (let j = 0; j < batch.length; j++) {
          results.push({
            embedding: response.data[j].embedding,
            tokenCount: this.countTokens(batch[j]),
            model: this.config.model,
          });
        }
      } catch (error) {
        throw new Error(`Failed to generate batch embeddings: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return results;
  }

  /**
   * Count tokens in text
   */
  private countTokens(text: string): number {
    return this.tokenizer.encode(text).length;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.tokenizer.free();
  }
}
