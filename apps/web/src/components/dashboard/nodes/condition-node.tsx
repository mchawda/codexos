'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import BaseNode from './base-node';

const ConditionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<GitBranch className="w-4 h-4 text-white" />}
      label="Condition"
      color="bg-indigo-500"
    >
      <div className="text-xs text-muted-foreground">
        {data.description || "If/else conditional logic"}
      </div>
    </BaseNode>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;