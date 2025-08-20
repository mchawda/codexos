'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileJson } from 'lucide-react';

function JsonNode({ data, selected }: NodeProps) {
  const [operation, setOperation] = useState(data.operation || 'parse');
  const [jsonPath, setJsonPath] = useState(data.jsonPath || '');

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-emerald-500"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-emerald-500 text-white">
          <FileJson className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">JSON</div>
          <div className="text-xs text-muted-foreground">Parse & transform</div>
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
            <option value="parse">Parse JSON</option>
            <option value="stringify">Stringify</option>
            <option value="extract">Extract Path</option>
            <option value="transform">Transform</option>
            <option value="validate">Validate</option>
          </select>
        </div>
        {(operation === 'extract' || operation === 'transform') && (
          <div>
            <label className="text-xs text-muted-foreground">JSON Path</label>
            <input 
              className="w-full px-2 py-1 text-xs border rounded bg-background font-mono"
              placeholder="$.data.items[0].name"
              value={jsonPath}
              onChange={(e) => setJsonPath(e.target.value)}
            />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-emerald-500"
      />
    </div>
  );
}

export default memo(JsonNode);
