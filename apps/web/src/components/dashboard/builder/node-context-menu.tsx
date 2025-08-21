// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Trash2, Edit, Link, Unlink } from 'lucide-react';

interface NodeContextMenuProps {
  id: string;
  children: React.ReactNode;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
}

export default function NodeContextMenu({
  id,
  children,
  onDelete,
  onDuplicate,
  onEdit,
}: NodeContextMenuProps) {
  const { getNode, getEdges, deleteElements } = useReactFlow();

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    } else {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, onDelete, deleteElements]);

  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate();
    } else {
      const node = getNode(id);
      if (node) {
        // Logic to duplicate node would go here
        console.log('Duplicate node:', node);
      }
    }
  }, [id, onDuplicate, getNode]);

  const handleDisconnect = useCallback(() => {
    const edges = getEdges();
    const connectedEdges = edges.filter(
      (edge) => edge.source === id || edge.target === id
    );
    deleteElements({ edges: connectedEdges });
  }, [id, getEdges, deleteElements]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Node
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDisconnect}>
          <Unlink className="mr-2 h-4 w-4" />
          Disconnect All
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
