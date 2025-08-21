// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo, ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface BaseNodeProps {
  data: any;
  selected?: boolean;
  icon: ReactNode;
  label: string;
  color: string;
  children?: ReactNode;
  sourceHandles?: boolean;
  targetHandles?: boolean;
}

const BaseNode = memo(({
  data,
  selected,
  icon,
  label,
  color,
  children,
  sourceHandles = true,
  targetHandles = true,
}: BaseNodeProps) => {
  return (
    <div
      className={cn(
        'min-w-[180px] rounded-xl border-2 bg-background shadow-lg transition-all',
        selected ? 'border-primary shadow-xl' : 'border-border/50 hover:border-border',
        'hover:shadow-xl'
      )}
    >
      {targetHandles && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-primary !w-3 !h-3 !border-2 !border-background"
        />
      )}
      
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className={cn('p-1.5 rounded-lg', color)}>
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        
        {children}
      </div>
      
      {sourceHandles && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-primary !w-3 !h-3 !border-2 !border-background"
        />
      )}
    </div>
  );
});

BaseNode.displayName = 'BaseNode';

export default BaseNode;
