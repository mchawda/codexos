// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { LogOut } from 'lucide-react';
import BaseNode from './base-node';

const ExitNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<LogOut className="w-4 h-4 text-white" />}
      label="Exit"
      color="bg-red-500"
      sourceHandles={false}
    >
      <div className="text-xs text-muted-foreground">
        End point of the flow
      </div>
    </BaseNode>
  );
});

ExitNode.displayName = 'ExitNode';

export default ExitNode;
