// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * ID generation utilities
 */

import { createHash } from 'crypto';

/**
 * Generate document ID from path/URL
 */
export function generateDocumentId(path: string): string {
  return createHash('sha256')
    .update(path)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Generate chunk ID from document ID and chunk index
 */
export function generateChunkId(documentId: string, chunkIndex: number): string {
  return `${documentId}_chunk_${chunkIndex}`;
}
