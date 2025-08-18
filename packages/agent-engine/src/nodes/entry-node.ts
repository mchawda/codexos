// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { BaseNode, NodeContext, NodeResult } from '../core/node';

export class EntryNode extends BaseNode {
  async execute(context: NodeContext): Promise<NodeResult> {
    const logs = [
      this.log('info', 'Flow execution started', {
        nodeId: this.id,
        input: context.input,
      }),
    ];

    return {
      output: context.input,
      logs,
    };
  }
}
