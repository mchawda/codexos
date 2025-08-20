'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Eye } from 'lucide-react';

function VisionNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-pink-500"
      />
      
      <div className="flex items-center">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-pink-500 text-white">
          <Eye className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Vision</div>
          <div className="text-xs text-muted-foreground">Image analysis</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-pink-500"
      />
    </div>
  );
}

export default memo(VisionNode);
