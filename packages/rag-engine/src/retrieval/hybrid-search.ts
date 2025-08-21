// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Hybrid search combining semantic and keyword search
 */

import { 
  SearchQuery, 
  SearchResponse, 
  SearchResult,
} from '../core/types';
import { SemanticSearch } from './semantic-search';
import { VectorStore } from '../storage/vector-store';

export class HybridSearch {
  private semanticSearch: SemanticSearch;
  private vectorStore: VectorStore;

  constructor(
    semanticSearch: SemanticSearch,
    vectorStore: VectorStore
  ) {
    this.semanticSearch = semanticSearch;
    this.vectorStore = vectorStore;
  }

  /**
   * Perform hybrid search combining semantic and keyword results
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    const alpha = query.hybridAlpha ?? 0.5; // Default to 50/50 mix

    // Perform semantic search
    const semanticResults = await this.semanticSearch.search({
      ...query,
      topK: (query.topK || 10) * 2, // Get more results for merging
    });

    // Perform keyword search
    const keywordChunks = await this.vectorStore.keywordSearch(
      query.query,
      (query.topK || 10) * 2,
      query.filter
    );

    // Convert keyword results to SearchResult format
    const keywordResults: SearchResult[] = keywordChunks.map((chunk, index) => ({
      chunk,
      score: 1 - (index / keywordChunks.length), // Simple ranking score
      highlights: this.generateKeywordHighlights(query.query, chunk.content),
    }));

    // Merge and rerank results
    const mergedResults = this.mergeResults(
      semanticResults.results,
      keywordResults,
      alpha
    );

    // Limit to requested topK
    const finalResults = mergedResults.slice(0, query.topK || 10);

    return {
      results: finalResults,
      totalResults: finalResults.length,
      query: query.query,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Merge semantic and keyword results with weighted scoring
   */
  private mergeResults(
    semanticResults: SearchResult[],
    keywordResults: SearchResult[],
    alpha: number
  ): SearchResult[] {
    const resultMap = new Map<string, SearchResult>();

    // Add semantic results with weighted scores
    for (const result of semanticResults) {
      const id = result.chunk.id;
      const weightedScore = result.score * alpha;
      
      resultMap.set(id, {
        ...result,
        score: weightedScore,
      });
    }

    // Add or merge keyword results
    for (const result of keywordResults) {
      const id = result.chunk.id;
      const weightedScore = result.score * (1 - alpha);
      
      if (resultMap.has(id)) {
        // Merge with existing result
        const existing = resultMap.get(id)!;
        resultMap.set(id, {
          ...existing,
          score: existing.score + weightedScore,
          highlights: [...(existing.highlights || []), ...(result.highlights || [])],
        });
      } else {
        // Add new result
        resultMap.set(id, {
          ...result,
          score: weightedScore,
        });
      }
    }

    // Sort by combined score
    const mergedResults = Array.from(resultMap.values());
    mergedResults.sort((a, b) => b.score - a.score);

    return mergedResults;
  }

  /**
   * Generate keyword-based highlights
   */
  private generateKeywordHighlights(query: string, content: string): string[] {
    const highlights: string[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    // Find sentences containing exact keyword matches
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      let matchCount = 0;
      
      for (const term of queryTerms) {
        if (sentenceLower.includes(term)) {
          matchCount++;
        }
      }
      
      if (matchCount > 0 && sentence.trim()) {
        highlights.push({
          text: sentence.trim(),
          matchCount,
        } as any);
      }
    }
    
    // Sort by match count and take top 3
    highlights.sort((a: any, b: any) => b.matchCount - a.matchCount);
    
    return highlights.slice(0, 3).map((h: any) => h.text);
  }
}
