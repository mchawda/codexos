// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Token counting utilities
 */

import { encoding_for_model } from 'tiktoken';

class TokenCounter {
  private tokenizer: any;

  constructor() {
    this.tokenizer = encoding_for_model('gpt-3.5-turbo');
  }

  /**
   * Count tokens in text
   */
  count(text: string): number {
    return this.tokenizer.encode(text).length;
  }

  /**
   * Count tokens for multiple texts
   */
  countBatch(texts: string[]): number[] {
    return texts.map(text => this.count(text));
  }

  /**
   * Estimate cost based on token count
   */
  estimateCost(
    tokens: number,
    model: string = 'gpt-3.5-turbo'
  ): { input: number; output: number } {
    const pricing: { [key: string]: { input: number; output: number } } = {
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'text-embedding-3-small': { input: 0.00002, output: 0 },
      'text-embedding-3-large': { input: 0.00013, output: 0 },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    
    return {
      input: (tokens / 1000) * modelPricing.input,
      output: (tokens / 1000) * modelPricing.output,
    };
  }

  /**
   * Cleanup tokenizer
   */
  cleanup(): void {
    this.tokenizer.free();
  }
}

// Export singleton instance
export const tokenCounter = new TokenCounter();
