'use client';

import { motion } from 'framer-motion';
import { 
  Bot, 
  Wrench, 
  Database, 
  GitBranch, 
  Eye, 
  Mic, 
  MousePointer, 
  LogIn, 
  LogOut 
} from 'lucide-react';

const nodeTypes = [
  { type: 'entry', label: 'Entry', icon: LogIn, color: 'bg-green-500' },
  { type: 'llm', label: 'LLM', icon: Bot, color: 'bg-violet-500' },
  { type: 'tool', label: 'Tool', icon: Wrench, color: 'bg-blue-500' },
  { type: 'rag', label: 'RAG', icon: Database, color: 'bg-amber-500' },
  { type: 'vision', label: 'Vision', icon: Eye, color: 'bg-pink-500' },
  { type: 'voice', label: 'Voice', icon: Mic, color: 'bg-teal-500' },
  { type: 'action', label: 'Action', icon: MousePointer, color: 'bg-orange-500' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-indigo-500' },
  { type: 'exit', label: 'Exit', icon: LogOut, color: 'bg-red-500' },
];

export default function NodeMenu() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="glass-dark rounded-xl p-3 border border-white/10">
      <h3 className="text-xs font-medium text-muted-foreground mb-3">Drag to add nodes</h3>
      <div className="grid grid-cols-3 gap-2">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
              className="cursor-move"
            >
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/10 transition-all">
                <div className={`p-2 rounded-lg ${node.color} mb-1`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs">{node.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
