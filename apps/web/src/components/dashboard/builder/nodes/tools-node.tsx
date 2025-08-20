'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Wrench } from 'lucide-react';

function ToolsNode({ data, selected }: NodeProps) {
  const [toolType, setToolType] = useState(data.toolType || 'text');
  const [operation, setOperation] = useState(data.operation || '');

  const operations = {
    text: ['Uppercase', 'Lowercase', 'Trim', 'Replace', 'Split', 'Join'],
    math: ['Add', 'Subtract', 'Multiply', 'Divide', 'Round', 'Random'],
    date: ['Now', 'Format', 'Add Days', 'Difference', 'Parse'],
    crypto: ['MD5', 'SHA256', 'Base64 Encode', 'Base64 Decode', 'UUID'],
    array: ['Length', 'First', 'Last', 'Reverse', 'Sort', 'Unique'],
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background min-w-[200px] ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-600"
      />
      
      <div className="flex items-center mb-3">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-600 text-white">
          <Wrench className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Tools</div>
          <div className="text-xs text-muted-foreground">Text, math, date tools</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Tool Type</label>
          <select 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={toolType}
            onChange={(e) => {
              setToolType(e.target.value);
              setOperation('');
            }}
          >
            <option value="text">Text</option>
            <option value="math">Math</option>
            <option value="date">Date</option>
            <option value="crypto">Crypto</option>
            <option value="array">Array</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Operation</label>
          <select 
            className="w-full px-2 py-1 text-xs border rounded bg-background"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="">Select operation</option>
            {operations[toolType as keyof typeof operations]?.map(op => (
              <option key={op} value={op.toLowerCase().replace(' ', '_')}>{op}</option>
            ))}
          </select>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-600"
      />
    </div>
  );
}

export default memo(ToolsNode);
