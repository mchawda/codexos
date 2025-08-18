// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { Node } from '../core/flow';
import { BaseNode } from '../core/node';
import { EntryNode } from './entry-node';
import { ExitNode } from './exit-node';
import { LLMNode } from './llm-node';
import { ToolNode } from './tool-node';
import { RAGNode } from './rag-node';
import { ConditionNode } from './condition-node';
import { VisionNode } from './vision-node';
import { VoiceNode } from './voice-node';
import { ActionNode } from './action-node';

export function createNode(node: Node): BaseNode {
  switch (node.type) {
    case 'entry':
      return new EntryNode(node.id, node.type, node.data);
    case 'exit':
      return new ExitNode(node.id, node.type, node.data);
    case 'llm':
      return new LLMNode(node.id, node.type, node.data);
    case 'tool':
      return new ToolNode(node.id, node.type, node.data);
    case 'rag':
      return new RAGNode(node.id, node.type, node.data);
    case 'condition':
      return new ConditionNode(node.id, node.type, node.data);
    case 'vision':
      return new VisionNode(node.id, node.type, node.data);
    case 'voice':
      return new VoiceNode(node.id, node.type, node.data);
    case 'action':
      return new ActionNode(node.id, node.type, node.data);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

export {
  EntryNode,
  ExitNode,
  LLMNode,
  ToolNode,
  RAGNode,
  ConditionNode,
  VisionNode,
  VoiceNode,
  ActionNode,
};
