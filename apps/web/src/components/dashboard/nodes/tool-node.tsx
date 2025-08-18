'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Wrench } from 'lucide-react';
import BaseNode from './base-node';

const ToolNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Wrench className="w-4 h-4 text-white" />}
      label="Tool"
      color="bg-blue-500"
    >
      <div className="text-xs text-muted-foreground">
        {data.description || "Execute external tool"}
      </div>
    </BaseNode>
  );
});

ToolNode.displayName = 'ToolNode';

export default ToolNode;