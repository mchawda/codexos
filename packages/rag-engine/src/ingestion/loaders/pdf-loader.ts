/**
 * PDF document loader
 */

import { readFile } from 'fs/promises';
import pdf from 'pdf-parse';

export class PDFLoader {
  /**
   * Load and extract text from PDF
   */
  async load(filePath: string): Promise<string> {
    try {
      const dataBuffer = await readFile(filePath);
      const data = await pdf(dataBuffer);
      
      // Clean up the extracted text
      let text = data.text;
      
      // Remove excessive whitespace
      text = text.replace(/\s+/g, ' ');
      
      // Fix common PDF extraction issues
      text = text.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between camelCase
      text = text.replace(/(\d+)([a-zA-Z])/g, '$1 $2'); // Add space between numbers and letters
      text = text.replace(/([a-zA-Z])(\d+)/g, '$1 $2'); // Add space between letters and numbers
      
      return text.trim();
    } catch (error) {
      throw new Error(`Failed to load PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract metadata from PDF
   */
  async extractMetadata(filePath: string): Promise<any> {
    try {
      const dataBuffer = await readFile(filePath);
      const data = await pdf(dataBuffer);
      
      return {
        pageCount: data.numpages,
        info: data.info,
        metadata: data.metadata,
      };
    } catch (error) {
      return {};
    }
  }
}
