// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Repeat } from 'lucide-react';

function IteratorNode({ data, selected }: NodeProps) {
  const [arrayPath, setArrayPath] = useState(data.arrayPath || '');
  const [batchSize, setBatchSize] = useState(data.batchSize || 1);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-yellow-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-yellow-500 text-white">
          <Repeat className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Iterator</div>
          <div className="text-xs text-muted-foreground">Process array items</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Array Path</label>
          <input 
            className="w-full px-2 py-1 text-xs border rounded bg-background font-mono"
            placeholder="$.data.items"
            value={arrayPath}
            onChange={(e) => setArrayPath(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Batch Size</label>
          <input 
            type="number"
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-yellow-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="complete"
        className="w-3 h-3 !bg-green-500"
        style={{ top: '50%' }}
      />
    </div>
  );
}

export default memo(IteratorNode);
