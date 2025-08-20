'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-indigo-500"
      />
      
      <div className="flex items-center">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-indigo-500 text-white">
          <GitBranch className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Condition</div>
          <div className="text-xs text-muted-foreground">Branch logic</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 !bg-green-500"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 !bg-red-500"
        style={{ left: '70%' }}
      />
    </div>
  );
}

export default memo(ConditionNode);
