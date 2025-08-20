'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArrowRight } from 'lucide-react';

function EntryNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <div className="flex items-center">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-green-500 text-white">
          <ArrowRight className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Entry</div>
          <div className="text-xs text-muted-foreground">Start point of the flow</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500"
      />
    </div>
  );
}

export default memo(EntryNode);
