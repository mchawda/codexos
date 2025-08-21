// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Clock } from 'lucide-react';

function DelayNode({ data, selected }: NodeProps) {
  const [duration, setDuration] = useState(data.duration || 1000);
  const [unit, setUnit] = useState(data.unit || 'ms');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-500 text-white">
          <Clock className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Delay</div>
          <div className="text-xs text-muted-foreground">Wait before continuing</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Duration</label>
            <input 
              type="number"
              className="w-full px-2 py-1 text-xs border rounded bg-background"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Unit</label>
            <select 
              className="px-2 py-1 text-xs border rounded bg-background"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="ms">ms</option>
              <option value="s">sec</option>
              <option value="m">min</option>
            </select>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-500"
      />
    </div>
  );
}

export default memo(DelayNode);
