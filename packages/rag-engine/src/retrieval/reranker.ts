// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Reranker for improving search results
 */

import { SearchResult } from '../core/types';

export class Reranker {
  private enabled: boolean;
  private model?: string;

  constructor(enabled: boolean = true, model?: string) {
    this.enabled = enabled;
    this.model = model || 'cohere-rerank-english-v2.0';
  }

  /**
   * Check if reranking is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Rerank search results
   */
  async rerank(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    if (!this.enabled || results.length === 0) {
      return results;
    }

    // For now, we'll use a simple reranking based on keyword density
    // In production, this would use Cohere's reranking API or similar
    return this.simpleRerank(query, results);
  }

  /**
   * Simple reranking based on keyword density and relevance
   */
  private simpleRerank(query: string, results: SearchResult[]): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Calculate reranking scores
    const rerankedResults = results.map(result => {
      const content = result.chunk.content.toLowerCase();
      
      // Calculate keyword density
      let keywordMatches = 0;
      let exactPhraseBonus = 0;
      
      // Check for exact phrase match
      if (content.includes(query.toLowerCase())) {
        exactPhraseBonus = 0.3;
      }
      
      // Count keyword occurrences
      for (const term of queryTerms) {
        const regex = new RegExp(`\\b${term}\\b`, 'g');
        const matches = content.match(regex);
        if (matches) {
          keywordMatches += matches.length;
        }
      }
      
      // Calculate density (normalized by content length)
      const density = keywordMatches / (content.length / 100);
      
      // Check for terms in title/metadata
      let metadataBonus = 0;
      if (result.chunk.metadata.title) {
        const title = result.chunk.metadata.title.toLowerCase();
        for (const term of queryTerms) {
          if (title.includes(term)) {
            metadataBonus += 0.1;
          }
        }
      }
      
      // Calculate final reranked score
      const rerankScore = 
        result.score * 0.4 + // Original similarity score
        Math.min(density * 0.1, 0.3) + // Keyword density (capped)
        exactPhraseBonus +
        metadataBonus;
      
      return {
        ...result,
        rerankedScore: rerankScore,
      };
    });
    
    // Sort by reranked score
    rerankedResults.sort((a, b) => 
      (b.rerankedScore || b.score) - (a.rerankedScore || a.score)
    );
    
    return rerankedResults;
  }

  /**
   * Rerank using external API (placeholder for Cohere, etc.)
   */
  private async apiRerank(
    query: string, 
    results: SearchResult[]
  ): Promise<SearchResult[]> {
    // This would integrate with Cohere's reranking API
    // For now, return results as-is
    console.warn('API reranking not implemented, using simple reranking');
    return this.simpleRerank(query, results);
  }
}
