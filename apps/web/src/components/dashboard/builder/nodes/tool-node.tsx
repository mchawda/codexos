'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Wrench } from 'lucide-react';

function ToolNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />
      
      <div className="flex items-center">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-500 text-white">
          <Wrench className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Tool</div>
          <div className="text-xs text-muted-foreground">External tool</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
}

export default memo(ToolNode);
