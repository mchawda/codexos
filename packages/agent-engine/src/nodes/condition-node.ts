// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { BaseNode, NodeContext, NodeResult } from '../core/node';

export class ConditionNode extends BaseNode {
  async execute(context: NodeContext): Promise<NodeResult> {
    const condition = this.data.condition || '';
    const trueNode = this.data.trueNode;
    const falseNode = this.data.falseNode;
    const logs = [];

    logs.push(
      this.log('info', 'Evaluating condition', {
        nodeId: this.id,
        condition,
      })
    );

    // TODO: Implement actual condition evaluation with expression parser
    const result = await this.evaluateCondition(condition, context);

    const nextNode = result ? trueNode : falseNode;

    logs.push(
      this.log('info', `Condition evaluated to ${result}`, {
        result,
        nextNode,
      })
    );

    return {
      output: context.input,
      nextNode,
      logs,
    };
  }

  private async evaluateCondition(condition: string, context: NodeContext): Promise<boolean> {
    // Simple condition evaluation for demo
    // In production, use a proper expression evaluator
    
    if (condition.includes('intent')) {
      const input = context.input;
      return input?.intent === 'customer_support';
    }

    // Default to true for now
    return true;
  }
}
