// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { LogOut } from 'lucide-react';

function ExitNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-background ${
      selected ? 'border-primary' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-500"
      />
      
      <div className="flex items-center">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-red-500 text-white">
          <LogOut className="w-5 h-5" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold">Exit</div>
          <div className="text-xs text-muted-foreground">End point of the flow</div>
        </div>
      </div>
    </div>
  );
}

export default memo(ExitNode);
