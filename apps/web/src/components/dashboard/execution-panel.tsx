// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Terminal, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isExecuting: boolean;
  onStopExecution: () => void;
}

// Mock execution logs
const mockLogs = [
  { id: '1', timestamp: '10:23:45', type: 'info', node: 'Entry', message: 'Flow execution started' },
  { id: '2', timestamp: '10:23:45', type: 'info', node: 'LLM', message: 'Processing user input...' },
  { id: '3', timestamp: '10:23:46', type: 'success', node: 'LLM', message: 'Intent classified: customer_support' },
  { id: '4', timestamp: '10:23:46', type: 'info', node: 'RAG', message: 'Retrieving relevant context...' },
  { id: '5', timestamp: '10:23:47', type: 'success', node: 'RAG', message: 'Found 5 relevant documents' },
  { id: '6', timestamp: '10:23:48', type: 'info', node: 'LLM', message: 'Generating response...' },
  { id: '7', timestamp: '10:23:49', type: 'success', node: 'LLM', message: 'Response generated successfully' },
  { id: '8', timestamp: '10:23:49', type: 'success', node: 'Exit', message: 'Flow completed' },
];

export default function ExecutionPanel({ isOpen, onClose, isExecuting, onStopExecution }: ExecutionPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed right-0 top-16 bottom-0 w-96 bg-background border-l border-border/50 shadow-xl z-30"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Execution Console</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Bar */}
            <div className="p-4 border-b border-border/50 bg-muted/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {isExecuting ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Running</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                      <span className="text-sm font-medium">Idle</span>
                    </>
                  )}
                </div>
                
                {isExecuting ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onStopExecution}
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {}}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Rerun
                  </Button>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-medium">4.2s</div>
                  <div className="text-muted-foreground">Duration</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <Terminal className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-medium">8</div>
                  <div className="text-muted-foreground">Steps</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <div className="font-medium">Success</div>
                  <div className="text-muted-foreground">Status</div>
                </div>
              </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {mockLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'p-3 rounded-lg border text-sm',
                    log.type === 'success' && 'border-green-500/20 bg-green-500/5',
                    log.type === 'error' && 'border-red-500/20 bg-red-500/5',
                    log.type === 'info' && 'border-border/50 bg-muted/5'
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {log.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                      {log.type === 'info' && <Terminal className="w-4 h-4 text-muted-foreground" />}
                      <Badge variant="outline" className="text-xs">
                        {log.node}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed pl-6">{log.message}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
