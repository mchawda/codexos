// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { v4 as uuidv4 } from 'uuid';
import { Flow, FlowGraph, Node } from './flow';
import { NodeContext, NodeResult, LogEntry, BaseNode } from './node';
import { createNode } from '../nodes';

export interface ExecutionOptions {
  maxSteps?: number;
  timeout?: number;
  vault?: Record<string, string>;
  initialState?: Record<string, any>;
}

export interface ExecutionResult {
  id: string;
  status: 'success' | 'failed' | 'timeout';
  output: any;
  logs: LogEntry[];
  steps: ExecutionStep[];
  startTime: Date;
  endTime: Date;
  error?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  startTime: Date;
  endTime: Date;
  input: any;
  output: any;
  logs: LogEntry[];
}

export class AgentExecutor {
  private flowGraph: FlowGraph;
  private nodeInstances: Map<string, BaseNode>;
  private logs: LogEntry[];
  private steps: ExecutionStep[];

  constructor(private flow: Flow) {
    this.flowGraph = new FlowGraph(flow);
    this.nodeInstances = new Map();
    this.logs = [];
    this.steps = [];

    // Validate flow
    const errors = this.flowGraph.validate();
    if (errors.length > 0) {
      throw new Error(`Invalid flow: ${errors.join(', ')}`);
    }

    // Create node instances
    flow.nodes.forEach(node => {
      const instance = createNode(node);
      this.nodeInstances.set(node.id, instance);
    });
  }

  async execute(input: any, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const executionId = uuidv4();
    const startTime = new Date();
    const maxSteps = options.maxSteps || 100;
    const timeout = options.timeout || 300000; // 5 minutes default

    const context: NodeContext = {
      input,
      state: options.initialState || {},
      memory: {},
      vault: options.vault || {},
    };

    try {
      // Start from entry node
      const entryNode = this.flowGraph.getEntryNode();
      if (!entryNode) {
        throw new Error('No entry node found');
      }

      let currentNodeId = entryNode.id;
      let stepCount = 0;
      const timeoutTime = Date.now() + timeout;

      while (currentNodeId && stepCount < maxSteps) {
        if (Date.now() > timeoutTime) {
          throw new Error('Execution timeout');
        }

        const node = this.flowGraph.getNode(currentNodeId);
        if (!node) {
          throw new Error(`Node ${currentNodeId} not found`);
        }

        const nodeInstance = this.nodeInstances.get(currentNodeId);
        if (!nodeInstance) {
          throw new Error(`Node instance ${currentNodeId} not found`);
        }

        // Execute node
        const stepStartTime = new Date();
        const stepLogs: LogEntry[] = [];

        this.log('info', `Executing node ${currentNodeId} (${node.type})`);

        const result = await nodeInstance.execute(context);

        const step: ExecutionStep = {
          nodeId: currentNodeId,
          nodeType: node.type,
          startTime: stepStartTime,
          endTime: new Date(),
          input: context.input,
          output: result.output,
          logs: result.logs || [],
        };

        this.steps.push(step);
        this.logs.push(...(result.logs || []));

        // Update context
        context.input = result.output;
        if (result.state) {
          Object.assign(context.state, result.state);
        }

        // Check if we've reached an exit node
        if (node.type === 'exit') {
          return {
            id: executionId,
            status: 'success',
            output: result.output,
            logs: this.logs,
            steps: this.steps,
            startTime,
            endTime: new Date(),
          };
        }

        // Determine next node
        if (result.nextNode) {
          currentNodeId = result.nextNode;
        } else {
          const nextNodes = this.flowGraph.getNextNodes(currentNodeId);
          currentNodeId = nextNodes[0]?.id ?? '';
        }

        stepCount++;
      }

      throw new Error('Maximum steps reached');
    } catch (error) {
      return {
        id: executionId,
        status: 'failed',
        output: null,
        logs: this.logs,
        steps: this.steps,
        startTime,
        endTime: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>) {
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      metadata,
    });
  }
}
