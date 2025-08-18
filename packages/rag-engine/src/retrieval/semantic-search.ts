/**
 * Semantic search service
 */

import { 
  SearchQuery, 
  SearchResponse, 
  SearchResult,
  DocumentChunk,
} from '../core/types';
import { VectorStore } from '../storage/vector-store';
import { EmbeddingService } from '../embeddings/embedding-service';
import { Reranker } from './reranker';

export class SemanticSearch {
  private vectorStore: VectorStore;
  private embeddingService: EmbeddingService;
  private reranker: Reranker;

  constructor(
    vectorStore: VectorStore,
    embeddingService: EmbeddingService
  ) {
    this.vectorStore = vectorStore;
    this.embeddingService = embeddingService;
    this.reranker = new Reranker();
  }

  /**
   * Perform semantic search
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.embed(query.query);

    // Search vector store
    const chunks = await this.vectorStore.search(
      queryEmbedding.embedding,
      query.topK || 10,
      query.filter
    );

    // Calculate similarity scores
    let results: SearchResult[] = chunks.map(chunk => {
      const score = this.embeddingService.cosineSimilarity(
        queryEmbedding.embedding,
        chunk.embedding!
      );

      return {
        chunk,
        score,
        highlights: this.generateHighlights(query.query, chunk.content),
      };
    });

    // Apply score threshold
    if (query.scoreThreshold) {
      results = results.filter(r => r.score >= query.scoreThreshold!);
    }

    // Rerank if enabled
    if (this.reranker.isEnabled()) {
      results = await this.reranker.rerank(query.query, results);
    }

    // Sort by score (or reranked score)
    results.sort((a, b) => {
      const scoreA = a.rerankedScore ?? a.score;
      const scoreB = b.rerankedScore ?? b.score;
      return scoreB - scoreA;
    });

    // Limit to topK
    if (query.topK) {
      results = results.slice(0, query.topK);
    }

    return {
      results,
      totalResults: results.length,
      query: query.query,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Generate highlights for search results
   */
  private generateHighlights(query: string, content: string): string[] {
    const highlights: string[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const hasMatch = queryTerms.some(term => 
        lowerSentence.includes(term)
      );

      if (hasMatch && sentence.trim()) {
        highlights.push(sentence.trim());
        if (highlights.length >= 3) break;
      }
    }

    return highlights;
  }
}
