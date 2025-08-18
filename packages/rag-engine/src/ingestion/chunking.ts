/**
 * Smart document chunking with overlap and metadata preservation
 */

import { encoding_for_model } from 'tiktoken';
import { Document, DocumentChunk, IngestionConfig, ChunkMetadata } from '../core/types';
import { generateChunkId } from '../utils/id-generator';

export class ChunkingService {
  private config: IngestionConfig;
  private tokenizer: any;

  constructor(config: IngestionConfig) {
    this.config = config;
    // Initialize tokenizer for accurate token counting
    this.tokenizer = encoding_for_model('gpt-3.5-turbo');
  }

  /**
   * Chunk document based on configuration
   */
  async chunk(document: Document): Promise<DocumentChunk[]> {
    switch (this.config.splitMethod) {
      case 'recursive':
        return this.recursiveChunk(document);
      case 'semantic':
        return this.semanticChunk(document);
      case 'fixed':
        return this.fixedChunk(document);
      default:
        return this.recursiveChunk(document);
    }
  }

  /**
   * Recursive character text splitting with overlap
   */
  private recursiveChunk(document: Document): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { chunkSize, chunkOverlap } = this.config;
    
    // Split by paragraphs first, then sentences if needed
    const paragraphs = document.content.split(/\n\n+/);
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;
    let startOffset = 0;

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.countTokens(paragraph);
      
      // If paragraph is too large, split by sentences
      if (paragraphTokens > chunkSize) {
        const sentences = this.splitIntoSentences(paragraph);
        
        for (const sentence of sentences) {
          const sentenceTokens = this.countTokens(sentence);
          
          if (currentTokens + sentenceTokens > chunkSize && currentChunk) {
            // Save current chunk
            chunks.push(this.createChunk(
              document,
              currentChunk.trim(),
              chunkIndex++,
              startOffset,
              startOffset + currentChunk.length
            ));
            
            // Start new chunk with overlap
            const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
            currentChunk = overlapText + sentence;
            currentTokens = this.countTokens(currentChunk);
            startOffset = startOffset + currentChunk.length - overlapText.length;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
            currentTokens += sentenceTokens;
          }
        }
      } else {
        // Add paragraph to current chunk
        if (currentTokens + paragraphTokens > chunkSize && currentChunk) {
          // Save current chunk
          chunks.push(this.createChunk(
            document,
            currentChunk.trim(),
            chunkIndex++,
            startOffset,
            startOffset + currentChunk.length
          ));
          
          // Start new chunk with overlap
          const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
          currentChunk = overlapText + paragraph;
          currentTokens = this.countTokens(currentChunk);
          startOffset = startOffset + currentChunk.length - overlapText.length;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
          currentTokens = this.countTokens(currentChunk);
        }
      }
    }

    // Add remaining chunk
    if (currentChunk) {
      chunks.push(this.createChunk(
        document,
        currentChunk.trim(),
        chunkIndex,
        startOffset,
        document.content.length
      ));
    }

    // Add overlap metadata
    this.addOverlapMetadata(chunks);

    return chunks;
  }

  /**
   * Semantic chunking based on content structure
   */
  private semanticChunk(document: Document): DocumentChunk[] {
    // For code files, chunk by functions/classes
    if (this.isCodeFile(document)) {
      return this.chunkCode(document);
    }
    
    // For markdown, chunk by headers
    if (document.metadata.source === 'markdown') {
      return this.chunkMarkdown(document);
    }
    
    // Default to recursive chunking
    return this.recursiveChunk(document);
  }

  /**
   * Fixed-size chunking
   */
  private fixedChunk(document: Document): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { chunkSize, chunkOverlap } = this.config;
    const tokens = this.tokenizer.encode(document.content);
    
    for (let i = 0; i < tokens.length; i += chunkSize - chunkOverlap) {
      const chunkTokens = tokens.slice(i, i + chunkSize);
      const chunkText = this.tokenizer.decode(chunkTokens);
      
      chunks.push(this.createChunk(
        document,
        chunkText,
        chunks.length,
        i,
        Math.min(i + chunkSize, tokens.length)
      ));
    }
    
    return chunks;
  }

  /**
   * Chunk code files by structure
   */
  private chunkCode(document: Document): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { chunkSize } = this.config;
    
    // Simple regex-based code splitting
    const functionPattern = /(?:function|class|def|const|let|var)\s+\w+[^{]*{[^}]*}/g;
    const matches = Array.from(document.content.matchAll(functionPattern));
    
    let lastIndex = 0;
    let chunkIndex = 0;
    
    for (const match of matches) {
      const functionCode = match[0];
      const functionTokens = this.countTokens(functionCode);
      
      // If function is too large, use recursive chunking on it
      if (functionTokens > chunkSize) {
        const subDoc: Document = {
          ...document,
          content: functionCode,
        };
        const subChunks = this.recursiveChunk(subDoc);
        chunks.push(...subChunks.map((chunk, idx) => ({
          ...chunk,
          chunkIndex: chunkIndex + idx,
        })));
        chunkIndex += subChunks.length;
      } else {
        chunks.push(this.createChunk(
          document,
          functionCode,
          chunkIndex++,
          match.index!,
          match.index! + functionCode.length
        ));
      }
      
      lastIndex = match.index! + functionCode.length;
    }
    
    // Add remaining content
    if (lastIndex < document.content.length) {
      const remaining = document.content.slice(lastIndex);
      if (remaining.trim()) {
        chunks.push(this.createChunk(
          document,
          remaining,
          chunkIndex,
          lastIndex,
          document.content.length
        ));
      }
    }
    
    return chunks;
  }

  /**
   * Chunk markdown by headers
   */
  private chunkMarkdown(document: Document): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { chunkSize } = this.config;
    
    // Split by headers
    const sections = document.content.split(/^(#{1,6}\s+.+)$/m);
    let currentSection = '';
    let chunkIndex = 0;
    let startOffset = 0;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionTokens = this.countTokens(section);
      
      if (section.match(/^#{1,6}\s+/)) {
        // This is a header
        if (currentSection && this.countTokens(currentSection) > 50) {
          // Save previous section
          chunks.push(this.createChunk(
            document,
            currentSection.trim(),
            chunkIndex++,
            startOffset,
            startOffset + currentSection.length
          ));
          startOffset += currentSection.length;
        }
        currentSection = section;
      } else {
        // Add content to current section
        currentSection += section;
        
        // Check if we need to split
        if (this.countTokens(currentSection) > chunkSize) {
          chunks.push(this.createChunk(
            document,
            currentSection.trim(),
            chunkIndex++,
            startOffset,
            startOffset + currentSection.length
          ));
          startOffset += currentSection.length;
          currentSection = '';
        }
      }
    }
    
    // Add remaining section
    if (currentSection.trim()) {
      chunks.push(this.createChunk(
        document,
        currentSection.trim(),
        chunkIndex,
        startOffset,
        document.content.length
      ));
    }
    
    return chunks;
  }

  /**
   * Create a document chunk
   */
  private createChunk(
    document: Document,
    content: string,
    chunkIndex: number,
    startOffset: number,
    endOffset: number
  ): DocumentChunk {
    const metadata: ChunkMetadata = {
      ...document.metadata,
      chunkIndex,
      startOffset,
      endOffset,
    };

    return {
      id: generateChunkId(document.id, chunkIndex),
      documentId: document.id,
      content,
      metadata,
      tokenCount: this.countTokens(content),
    };
  }

  /**
   * Add overlap metadata to chunks
   */
  private addOverlapMetadata(chunks: DocumentChunk[]): void {
    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        chunks[i].metadata.overlapWithPrevious = this.calculateOverlap(
          chunks[i - 1].content,
          chunks[i].content
        );
      }
      
      if (i < chunks.length - 1) {
        chunks[i].metadata.overlapWithNext = this.calculateOverlap(
          chunks[i].content,
          chunks[i + 1].content
        );
      }
    }
  }

  /**
   * Calculate overlap between chunks
   */
  private calculateOverlap(chunk1: string, chunk2: string): number {
    // Find common suffix/prefix
    const minLength = Math.min(chunk1.length, chunk2.length);
    let overlap = 0;
    
    for (let i = 1; i <= minLength; i++) {
      if (chunk1.slice(-i) === chunk2.slice(0, i)) {
        overlap = i;
      }
    }
    
    return overlap;
  }

  /**
   * Get overlap text from the end of a chunk
   */
  private getOverlapText(text: string, overlapTokens: number): string {
    const tokens = this.tokenizer.encode(text);
    const overlapStart = Math.max(0, tokens.length - overlapTokens);
    const overlapTokensSlice = tokens.slice(overlapStart);
    return this.tokenizer.decode(overlapTokensSlice);
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - can be improved with NLP libraries
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  /**
   * Count tokens in text
   */
  private countTokens(text: string): number {
    return this.tokenizer.encode(text).length;
  }

  /**
   * Check if document is a code file
   */
  private isCodeFile(document: Document): boolean {
    const codeExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.go', '.rs'];
    return codeExtensions.some(ext => 
      document.metadata.filePath?.endsWith(ext)
    );
  }

  /**
   * Cleanup tokenizer
   */
  cleanup(): void {
    this.tokenizer.free();
  }
}
