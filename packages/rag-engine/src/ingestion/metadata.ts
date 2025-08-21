// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Metadata extraction utilities
 */

import { DocumentMetadata, DocumentSource } from '../core/types';

/**
 * Extract metadata from document content and source
 */
export function extractMetadata(
  content: string,
  source: DocumentSource,
  filePath?: string
): Partial<DocumentMetadata> {
  const metadata: Partial<DocumentMetadata> = {
    source,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Extract based on source type
  switch (source) {
    case 'markdown':
      Object.assign(metadata, extractMarkdownMetadata(content));
      break;
    case 'pdf':
      // PDF metadata is extracted by pdf-parse
      break;
    case 'github':
      // GitHub metadata is extracted by the loader
      break;
    case 'web':
      // Web metadata is extracted by the loader
      break;
  }

  // Extract language from file extension
  if (filePath) {
    metadata.language = detectLanguage(filePath);
  }

  return metadata;
}

/**
 * Extract metadata from markdown frontmatter
 */
function extractMarkdownMetadata(content: string): Partial<DocumentMetadata> {
  const metadata: Partial<DocumentMetadata> = {};
  
  // Check for YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    
    // Simple YAML parsing
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase();
        const value = match[2].trim();
        
        switch (key) {
          case 'title':
            metadata.title = value.replace(/^["']|["']$/g, '');
            break;
          case 'author':
            metadata.author = value.replace(/^["']|["']$/g, '');
            break;
          case 'tags':
            metadata.tags = value.split(',').map(t => t.trim());
            break;
          case 'date':
            metadata.createdAt = new Date(value);
            break;
        }
      }
    }
  }

  // Extract title from first H1 if not in frontmatter
  if (!metadata.title) {
    const h1Match = content.match(/^# (.+)$/m);
    if (h1Match) {
      metadata.title = h1Match[1];
    }
  }

  return metadata;
}

/**
 * Detect programming language from file extension
 */
function detectLanguage(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'r': 'r',
    'sql': 'sql',
    'sh': 'bash',
    'md': 'markdown',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
  };

  return ext ? languageMap[ext] : undefined;
}
