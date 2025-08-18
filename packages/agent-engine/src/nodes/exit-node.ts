// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

import { BaseNode, NodeContext, NodeResult } from '../core/node';

export class ExitNode extends BaseNode {
  async execute(context: NodeContext): Promise<NodeResult> {
    const logs = [
      this.log('info', 'Flow execution completed', {
        nodeId: this.id,
        output: context.input,
      }),
    ];

    return {
      output: context.input,
      logs,
    };
  }
}
