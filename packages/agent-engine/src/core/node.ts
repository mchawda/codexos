// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { z } from 'zod';

export interface NodeContext {
  input: any;
  state: Record<string, any>;
  memory: Record<string, any>;
  vault: Record<string, string>;
  ragContext?: string[];
}

export interface NodeResult {
  output: any;
  nextNode?: string;
  state?: Record<string, any>;
  logs?: LogEntry[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

export abstract class BaseNode {
  constructor(
    protected id: string,
    protected type: string,
    protected data: Record<string, any>
  ) {}

  abstract execute(context: NodeContext): Promise<NodeResult>;

  protected log(level: LogEntry['level'], message: string, metadata?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      metadata,
    };
  }
}
