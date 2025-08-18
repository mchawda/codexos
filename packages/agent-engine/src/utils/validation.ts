// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { z } from 'zod';
import { FlowSchema, Flow } from '../core/flow';

export function validateFlow(flow: unknown): Flow {
  try {
    return FlowSchema.parse(flow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      throw new Error(`Flow validation failed: ${issues}`);
    }
    throw error;
  }
}

export function validateNodeConnections(flow: Flow): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(flow.nodes.map(n => n.id));

  // Check that all edge sources and targets exist
  flow.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} has invalid source: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} has invalid target: ${edge.target}`);
    }
  });

  // Check for cycles (excluding self-loops for condition nodes)
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = flow.edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (hasCycle(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        // Allow self-loops only for condition nodes
        const targetNode = flow.nodes.find(n => n.id === edge.target);
        if (targetNode?.type !== 'condition') {
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Check each unvisited node
  flow.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        errors.push('Flow contains a cycle');
      }
    }
  });

  return errors;
}
