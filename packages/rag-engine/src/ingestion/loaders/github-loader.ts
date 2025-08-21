// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * GitHub repository loader
 */

import axios from 'axios';
import { SUPPORTED_FILE_TYPES } from '../../core/config';

export class GitHubLoader {
  private githubToken?: string;

  constructor(githubToken?: string) {
    this.githubToken = githubToken || process.env.GITHUB_TOKEN;
  }

  /**
   * Load content from GitHub repository
   */
  async load(
    repoUrl: string,
    options?: {
      branch?: string;
      paths?: string[];
      recursive?: boolean;
    }
  ): Promise<{ content: string; extractedMetadata: any }> {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    const branch = options?.branch || 'main';
    
    try {
      // Get repository info
      const repoInfo = await this.getRepoInfo(owner, repo);
      
      // Get file tree
      const tree = await this.getFileTree(owner, repo, branch);
      
      // Filter files based on supported types and paths
      const files = this.filterFiles(tree, options?.paths);
      
      // Load content from files
      const contents: string[] = [];
      for (const file of files) {
        try {
          const content = await this.getFileContent(owner, repo, file.path);
          contents.push(`\n\n--- File: ${file.path} ---\n\n${content}`);
        } catch (error) {
          console.warn(`Failed to load ${file.path}:`, error);
        }
      }
      
      return {
        content: contents.join('\n'),
        extractedMetadata: {
          repository: `${owner}/${repo}`,
          branch,
          description: repoInfo.description,
          language: repoInfo.language,
          stars: repoInfo.stargazers_count,
          lastUpdated: repoInfo.updated_at,
          fileCount: files.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to load GitHub repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    return { owner: match[1], repo: match[2].replace('.git', '') };
  }

  /**
   * Get repository information
   */
  private async getRepoInfo(owner: string, repo: string): Promise<any> {
    const response = await this.githubRequest(
      `https://api.github.com/repos/${owner}/${repo}`
    );
    return response.data;
  }

  /**
   * Get file tree from repository
   */
  private async getFileTree(owner: string, repo: string, branch: string): Promise<any[]> {
    const response = await this.githubRequest(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );
    return response.data.tree.filter((item: any) => item.type === 'blob');
  }

  /**
   * Filter files based on supported types and paths
   */
  private filterFiles(tree: any[], paths?: string[]): any[] {
    return tree.filter(file => {
      // Check if file has supported extension
      const hasSupported = SUPPORTED_FILE_TYPES.some(ext => 
        file.path.toLowerCase().endsWith(ext)
      );
      
      if (!hasSupported) return false;
      
      // Check if file matches path filters
      if (paths && paths.length > 0) {
        return paths.some(path => file.path.startsWith(path));
      }
      
      return true;
    });
  }

  /**
   * Get file content
   */
  private async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const response = await this.githubRequest(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    );
    
    // Decode base64 content
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return content;
  }

  /**
   * Make authenticated GitHub API request
   */
  private async githubRequest(url: string): Promise<any> {
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CodexOS RAG Engine',
    };
    
    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }
    
    return await axios.get(url, { headers });
  }
}
