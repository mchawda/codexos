// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Eye } from 'lucide-react';
import BaseNode from './base-node';

const VisionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Eye className="w-4 h-4 text-white" />}
      label="Vision"
      color="bg-pink-500"
    >
      <div className="text-xs text-muted-foreground">
        {data.description || "Process images and visual data"}
      </div>
    </BaseNode>
  );
});

VisionNode.displayName = 'VisionNode';

export default VisionNode;