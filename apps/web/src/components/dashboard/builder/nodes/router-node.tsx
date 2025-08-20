'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

function RouterNode({ data, selected }: NodeProps) {
  const [conditions, setConditions] = useState(data.conditions || 2);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-purple-500 text-white">
          <GitBranch className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Router</div>
          <div className="text-xs text-muted-foreground">Route based on conditions</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Number of Routes</label>
          <input 
            type="number"
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={conditions}
            onChange={(e) => setConditions(parseInt(e.target.value) || 2)}
            min="2"
            max="10"
          />
        </div>
      </div>

      {/* Multiple output handles for different routes */}
      {Array.from({ length: Math.min(conditions, 4) }, (_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Bottom}
          id={`route-${i}`}
          className="w-3 h-3 !bg-purple-500"
          style={{ left: `${25 + (i * 50 / Math.min(conditions, 4))}%` }}
        />
      ))}
    </div>
  );
}

export default memo(RouterNode);
