'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';

function ActionNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-yellow-500"
      />
      
      <div className="flex items-center">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-yellow-500 text-white">
          <Zap className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Action</div>
          <div className="text-xs text-muted-foreground">Execute action</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-yellow-500"
      />
    </div>
  );
}

export default memo(ActionNode);
