// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Layers } from 'lucide-react';

function AggregatorNode({ data, selected }: NodeProps) {
  const [operation, setOperation] = useState(data.operation || 'merge');
  const [waitForAll, setWaitForAll] = useState(data.waitForAll || true);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        className="w-3 h-3 !bg-green-500"
        style={{ top: '50%' }}
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-green-500 text-white">
          <Layers className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Aggregator</div>
          <div className="text-xs text-muted-foreground">Merge multiple bundles</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Operation</label>
          <select 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="merge">Merge Arrays</option>
            <option value="concat">Concatenate</option>
            <option value="sum">Sum Values</option>
            <option value="average">Average</option>
            <option value="custom">Custom Function</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="waitForAll"
            checked={waitForAll}
            onChange={(e) => setWaitForAll(e.target.checked)}
            className="h-3 w-3"
          />
          <label htmlFor="waitForAll" className="text-xs text-muted-foreground">
            Wait for all inputs
          </label>
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

export default memo(AggregatorNode);
