'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { MousePointer } from 'lucide-react';
import BaseNode from './base-node';

const ActionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<MousePointer className="w-4 h-4 text-white" />}
      label="Action"
      color="bg-orange-500"
    >
      <div className="text-xs text-muted-foreground">
        {data.description || "Execute browser or system action"}
      </div>
    </BaseNode>
  );
});

ActionNode.displayName = 'ActionNode';

export default ActionNode;