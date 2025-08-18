/**
 * Text processing utilities
 */

/**
 * Clean and normalize text
 */
export function cleanText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Extract sentences from text
 */
export function extractSentences(text: string): string[] {
  // Improved sentence splitting
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  // Simple keyword extraction - can be improved with NLP
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count frequency
  const frequency: { [key: string]: number } = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }
  
  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Calculate text similarity (Jaccard similarity)
 */
export function textSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Truncate text to maximum length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  
  // Try to break at word boundary
  const truncated = text.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
}
