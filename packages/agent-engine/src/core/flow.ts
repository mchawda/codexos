// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { z } from 'zod';

export const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['entry', 'exit', 'llm', 'tool', 'rag', 'vault', 'condition', 'vision', 'voice', 'action']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

export const FlowSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    multimodal_enabled: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
  }).optional(),
});

export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type Flow = z.infer<typeof FlowSchema>;

export class FlowGraph {
  private nodes: Map<string, Node>;
  private edges: Map<string, Edge>;
  private adjacencyList: Map<string, string[]>;

  constructor(flow: Flow) {
    this.nodes = new Map(flow.nodes.map(node => [node.id, node]));
    this.edges = new Map(flow.edges.map(edge => [edge.id, edge]));
    this.adjacencyList = new Map();

    // Build adjacency list
    flow.edges.forEach(edge => {
      if (!this.adjacencyList.has(edge.source)) {
        this.adjacencyList.set(edge.source, []);
      }
      this.adjacencyList.get(edge.source)!.push(edge.target);
    });
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  getNextNodes(nodeId: string): Node[] {
    const nextNodeIds = this.adjacencyList.get(nodeId) || [];
    return nextNodeIds.map(id => this.nodes.get(id)!).filter(Boolean);
  }

  getEntryNode(): Node | undefined {
    return Array.from(this.nodes.values()).find(node => node.type === 'entry');
  }

  getExitNodes(): Node[] {
    return Array.from(this.nodes.values()).filter(node => node.type === 'exit');
  }

  validate(): string[] {
    const errors: string[] = [];

    // Check for entry node
    const entryNode = this.getEntryNode();
    if (!entryNode) {
      errors.push('Flow must have exactly one entry node');
    }

    // Check for at least one exit node
    const exitNodes = this.getExitNodes();
    if (exitNodes.length === 0) {
      errors.push('Flow must have at least one exit node');
    }

    // Check for disconnected nodes
    const visited = new Set<string>();
    if (entryNode) {
      this.dfs(entryNode.id, visited);
    }

    this.nodes.forEach((node, id) => {
      if (!visited.has(id)) {
        errors.push(`Node ${id} is not connected to the flow`);
      }
    });

    return errors;
  }

  private dfs(nodeId: string, visited: Set<string>) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const nextNodes = this.getNextNodes(nodeId);
    nextNodes.forEach(node => this.dfs(node.id, visited));
  }
}
