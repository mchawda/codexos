// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { LogIn } from 'lucide-react';
import BaseNode from './base-node';

const EntryNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<LogIn className="w-4 h-4 text-white" />}
      label="Entry"
      color="bg-green-500"
      targetHandles={false}
    >
      <div className="text-xs text-muted-foreground">
        Start point of the flow
      </div>
    </BaseNode>
  );
});

EntryNode.displayName = 'EntryNode';

export default EntryNode;
