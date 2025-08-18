/**
 * Document loader for various sources
 */

import { readFile } from 'fs/promises';
import { basename, extname } from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Document, DocumentSource, IngestionConfig } from '../core/types';
import { PDFLoader } from './loaders/pdf-loader';
import { GitHubLoader } from './loaders/github-loader';
import { generateDocumentId } from '../utils/id-generator';

export class DocumentLoader {
  private config: IngestionConfig;
  private loaders: Map<DocumentSource, any>;

  constructor(config: IngestionConfig) {
    this.config = config;
    this.loaders = new Map([
      ['pdf', new PDFLoader()],
      ['github', new GitHubLoader()],
    ]);
  }

  /**
   * Load document from various sources
   */
  async load(
    source: DocumentSource,
    path: string,
    metadata?: any
  ): Promise<Document> {
    switch (source) {
      case 'pdf':
        return await this.loadPDF(path, metadata);
      case 'github':
        return await this.loadGitHub(path, metadata);
      case 'web':
        return await this.loadWeb(path, metadata);
      case 'text':
      case 'markdown':
        return await this.loadText(path, metadata);
      default:
        throw new Error(`Unsupported document source: ${source}`);
    }
  }

  /**
   * Load PDF document
   */
  private async loadPDF(path: string, metadata?: any): Promise<Document> {
    const loader = this.loaders.get('pdf');
    const content = await loader.load(path);
    
    return {
      id: generateDocumentId(path),
      content,
      metadata: {
        source: 'pdf',
        filePath: path,
        title: metadata?.title || basename(path, '.pdf'),
        ...metadata,
      },
    };
  }

  /**
   * Load from GitHub repository
   */
  private async loadGitHub(path: string, metadata?: any): Promise<Document> {
    const loader = this.loaders.get('github');
    const { content, extractedMetadata } = await loader.load(path, metadata);
    
    return {
      id: generateDocumentId(path),
      content,
      metadata: {
        source: 'github',
        url: path,
        ...extractedMetadata,
        ...metadata,
      },
    };
  }

  /**
   * Load web page
   */
  private async loadWeb(url: string, metadata?: any): Promise<Document> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'CodexOS RAG Engine/1.0',
        },
      });

      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Extract text content
      const content = $('body').text().trim();
      
      // Extract metadata
      const title = $('title').text() || $('h1').first().text() || 'Untitled';
      const description = $('meta[name="description"]').attr('content') || '';
      const author = $('meta[name="author"]').attr('content') || '';
      
      return {
        id: generateDocumentId(url),
        content,
        metadata: {
          source: 'web',
          url,
          title,
          description,
          author,
          ...metadata,
        },
      };
    } catch (error) {
      throw new Error(`Failed to load web page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load text or markdown file
   */
  private async loadText(path: string, metadata?: any): Promise<Document> {
    try {
      const content = await readFile(path, 'utf-8');
      const ext = extname(path).toLowerCase();
      const source: DocumentSource = ext === '.md' || ext === '.mdx' ? 'markdown' : 'text';
      
      return {
        id: generateDocumentId(path),
        content,
        metadata: {
          source,
          filePath: path,
          title: metadata?.title || basename(path, ext),
          ...metadata,
        },
      };
    } catch (error) {
      throw new Error(`Failed to load text file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load multiple documents in batch
   */
  async loadBatch(
    sources: Array<{ source: DocumentSource; path: string; metadata?: any }>
  ): Promise<Document[]> {
    const documents: Document[] = [];
    
    for (const { source, path, metadata } of sources) {
      try {
        const doc = await this.load(source, path, metadata);
        documents.push(doc);
      } catch (error) {
        console.error(`Failed to load document from ${path}:`, error);
      }
    }
    
    return documents;
  }
}
