// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  X,
  Save,
  Download,
  Upload,
  Play,
  Copy,
  Trash2,
  Plus,
  Edit2,
  ChevronRight,
  Package,
  Sparkles,
  FileText,
  Github,
  Globe,
  Hash,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ContextBasketItem, RAGTemplate } from './types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ContextBasketProps {
  items: ContextBasketItem[];
  onItemsReorder: (items: ContextBasketItem[]) => void;
  onItemRemove: (chunkId: string) => void;
  onItemUpdate: (chunkId: string, customPrompt: string) => void;
  onClear: () => void;
  onSaveAsTemplate: (name: string, description: string) => void;
  onExecuteWithAgent: (agentId: string) => void;
  templates?: RAGTemplate[];
  onLoadTemplate?: (template: RAGTemplate) => void;
}

const sourceIcons = {
  pdf: FileText,
  github: Github,
  web: Globe,
  text: FileText,
  markdown: FileText,
};

export default function ContextBasket({
  items,
  onItemsReorder,
  onItemRemove,
  onItemUpdate,
  onClear,
  onSaveAsTemplate,
  onExecuteWithAgent,
  templates = [],
  onLoadTemplate,
}: ContextBasketProps) {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const chunkData = JSON.parse(e.dataTransfer.getData('chunk'));
        // Check if chunk is already in basket
        if (!items.find((item) => item.chunkId === chunkData.id)) {
          const newItem: ContextBasketItem = {
            chunkId: chunkData.id,
            chunk: chunkData,
            order: items.length,
          };
          onItemsReorder([...items, newItem]);
        }
      } catch (error) {
        console.error('Failed to add chunk to basket:', error);
      }
    },
    [items, onItemsReorder]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    onSaveAsTemplate(templateName, templateDescription);
    setIsTemplateDialogOpen(false);
    setTemplateName('');
    setTemplateDescription('');
    toast({
      title: 'Template saved',
      description: `RAG template "${templateName}" has been saved successfully.`,
    });
  };

  const handleExport = () => {
    const exportData = {
      name: 'RAG Context Export',
      items: items.map((item) => ({
        content: item.chunk.content,
        metadata: item.chunk.metadata,
        customPrompt: item.customPrompt,
      })),
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-context-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalTokens = items.reduce((sum, item) => {
    // Rough estimation: ~4 characters per token
    return sum + Math.ceil(item.chunk.content.length / 4);
  }, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Context Basket
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {items.length} chunks • ~{totalTokens} tokens
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExport}
                    disabled={items.length === 0}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export context</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClear}
                    disabled={items.length === 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {items.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex-1 flex items-center justify-center p-8"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No context chunks yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag chunks here or click "Add to Context"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea 
              className="flex-1 px-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={onItemsReorder}
                className="space-y-2 py-2"
              >
                <AnimatePresence>
                  {items.map((item) => {
                    const Icon = sourceIcons[item.chunk.metadata.source as keyof typeof sourceIcons] || FileText;
                    
                    return (
                      <Reorder.Item
                        key={item.chunkId}
                        value={item}
                        className="relative"
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group relative p-3 rounded-lg border bg-card hover:shadow-sm transition-all"
                        >
                          {/* Drag Handle */}
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="pl-6 pr-8 space-y-2">
                            {/* Chunk Info */}
                            <div className="flex items-start gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {item.chunk.metadata.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Chunk {item.chunk.metadata.chunkIndex}</span>
                                  {item.chunk.metadata.score && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {(item.chunk.metadata.score * 100).toFixed(0)}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Content Preview */}
                            <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                              {item.chunk.content}
                            </p>

                            {/* Custom Prompt */}
                            {editingItem === item.chunkId ? (
                              <div className="pl-6 space-y-2">
                                <Textarea
                                  value={customPrompts[item.chunkId] || item.customPrompt || ''}
                                  onChange={(e) =>
                                    setCustomPrompts({
                                      ...customPrompts,
                                      [item.chunkId]: e.target.value,
                                    })
                                  }
                                  placeholder="Add custom instructions for this chunk..."
                                  className="min-h-[60px] text-xs"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingItem(null);
                                      setCustomPrompts({
                                        ...customPrompts,
                                        [item.chunkId]: item.customPrompt || '',
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      onItemUpdate(
                                        item.chunkId,
                                        customPrompts[item.chunkId] || ''
                                      );
                                      setEditingItem(null);
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              item.customPrompt && (
                                <div className="pl-6">
                                  <p className="text-xs text-primary italic">
                                    "{item.customPrompt}"
                                  </p>
                                </div>
                              )
                            )}

                            {/* Tags */}
                            {item.chunk.metadata.tags && item.chunk.metadata.tags.length > 0 && (
                              <div className="pl-6 flex flex-wrap gap-1">
                                {item.chunk.metadata.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs h-5">
                                    <Hash className="w-2.5 h-2.5 mr-0.5" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingItem(
                                    editingItem === item.chunkId ? null : item.chunkId
                                  );
                                  if (!customPrompts[item.chunkId]) {
                                    setCustomPrompts({
                                      ...customPrompts,
                                      [item.chunkId]: item.customPrompt || '',
                                    });
                                  }
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onItemRemove(item.chunkId)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    );
                  })}
                </AnimatePresence>
              </Reorder.Group>
            </ScrollArea>

            {/* Actions Footer */}
            <div className="p-4 border-t space-y-3">
              <div className="flex gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save as Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save RAG Template</DialogTitle>
                      <DialogDescription>
                        Save this context configuration as a reusable template
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Template Name</label>
                        <Input
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="e.g., Customer Support Context"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description (optional)</label>
                        <Textarea
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          placeholder="Describe what this template is for..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTemplate}>Save Template</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  className="flex-1"
                  onClick={() => onExecuteWithAgent('current')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Use in Agent
                </Button>
              </div>

              {/* Template Quick Access */}
              {templates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Load template:</p>
                  <div className="flex flex-wrap gap-2">
                    {templates.slice(0, 3).map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadTemplate?.(template)}
                        className="text-xs"
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
