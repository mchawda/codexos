// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Database } from 'lucide-react';
import BaseNode from './base-node';

const RAGNode = memo(({ data, selected }: NodeProps) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={<Database className="w-4 h-4 text-white" />}
      label="RAG"
      color="bg-amber-500"
    >
      <div className="text-xs text-muted-foreground">
        {data.description || "Retrieve context from knowledge base"}
      </div>
    </BaseNode>
  );
});

RAGNode.displayName = 'RAGNode';

export default RAGNode;