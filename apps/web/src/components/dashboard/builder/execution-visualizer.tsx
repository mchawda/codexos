// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node, Edge } from 'reactflow';
import { 
  Play, 
  Pause, 
  Square, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Activity,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface ExecutionState {
  id: string;
  status: 'idle' | 'queued' | 'warming-up' | 'processing' | 'cooling-down' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: Date;
  duration?: number;
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  nodeId: string;
  message: string;
  details?: any;
}

export interface ExecutionMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  averageNodeTime: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ExecutionVisualizerProps {
  nodes: Node[];
  edges: Edge[];
  isExecuting: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepThrough: () => void;
  executionState?: ExecutionState;
  hideEdgesDuringExecution?: boolean;
  onToggleHideEdges?: (hide: boolean) => void;
}

interface FlowParticle {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  progress: number;
  type: 'data' | 'signal' | 'error';
  color: string;
  size: number;
  speed: number;
}

interface NodeVisualState {
  id: string;
  status: ExecutionState['status'];
  pulseIntensity: number;
  glowColor: string;
  borderWidth: number;
  shadowBlur: number;
  particles: FlowParticle[];
}

export function ExecutionVisualizer({
  nodes,
  edges,
  isExecuting,
  onStart,
  onPause,
  onStop,
  onStepThrough,
  executionState,
  hideEdgesDuringExecution = true,
  onToggleHideEdges
}: ExecutionVisualizerProps) {
  const [nodeStates, setNodeStates] = useState<Map<string, NodeVisualState>>(new Map());
  // const [flowParticles, setFlowParticles] = useState<FlowParticle[]>([]);
  const [currentExecutingNode, setCurrentExecutingNode] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);

  // Status color mapping
  const getStatusColor = (status: ExecutionState['status']) => {
    switch (status) {
      case 'idle': return '#6b7280';
      case 'queued': return '#f59e0b';
      case 'warming-up': return '#10b981';
      case 'processing': return '#3b82f6';
      case 'cooling-down': return '#8b5cf6';
      case 'completed': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: ExecutionState['status']) => {
    switch (status) {
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'queued': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'warming-up': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'processing': return <Zap className="w-4 h-4 animate-pulse" />;
      case 'cooling-down': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Removed particle flow animation to clean up execution visualization

  // Update node visual states
  const updateNodeState = useCallback((nodeId: string, status: ExecutionState['status']) => {
    setNodeStates(prev => {
      const newStates = new Map(prev);
      const currentState = newStates.get(nodeId) || {
        id: nodeId,
        status: 'idle',
        pulseIntensity: 0,
        glowColor: '#6b7280',
        borderWidth: 1,
        shadowBlur: 0,
        particles: []
      };

      const updatedState: NodeVisualState = {
        ...currentState,
        status,
        glowColor: getStatusColor(status),
        pulseIntensity: status === 'processing' ? 1 : status === 'warming-up' ? 0.7 : 0,
        borderWidth: status === 'processing' ? 3 : status === 'completed' ? 2 : 1,
        shadowBlur: status === 'processing' ? 20 : status === 'completed' ? 10 : 0,
      };

      newStates.set(nodeId, updatedState);
      return newStates;
    });
  }, []);

  // Simulate execution flow
  const simulateExecution = useCallback(async () => {
    if (!isExecuting || nodes.length === 0) return;

    // Find entry node
    const entryNode = nodes.find(n => n.type === 'entry' || n.id === '1');
    if (!entryNode) return;

    // Create execution sequence
    const executionSequence: string[] = [entryNode.id];
    const visited = new Set([entryNode.id]);
    
    // Build execution path using edges
    let currentNodes = [entryNode.id];
    while (currentNodes.length > 0) {
      const nextNodes: string[] = [];
      for (const nodeId of currentNodes) {
        const outgoingEdges = edges.filter(e => e.source === nodeId);
        for (const edge of outgoingEdges) {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            nextNodes.push(edge.target);
            executionSequence.push(edge.target);
          }
        }
      }
      currentNodes = nextNodes;
    }

    // Execute nodes in sequence
    for (let i = 0; i < executionSequence.length; i++) {
      const nodeId = executionSequence[i];
      const nextNodeId = executionSequence[i + 1];
      
      setCurrentExecutingNode(nodeId);
      setExecutionProgress((i / executionSequence.length) * 100);

      // Node execution phases
      const phases: ExecutionState['status'][] = ['queued', 'warming-up', 'processing', 'cooling-down', 'completed'];
      
      for (const phase of phases) {
        if (!isExecuting) return; // Check if execution was stopped
        
        updateNodeState(nodeId, phase);
        
        // Phase-specific delays
        const delay = phase === 'processing' ? 2000 : phase === 'warming-up' ? 800 : 500;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Removed flow particles for cleaner visualization
      }
    }

    setCurrentExecutingNode(null);
    setExecutionProgress(100);
  }, [isExecuting, nodes, edges, updateNodeState]);

  // Start execution simulation when isExecuting changes
  useEffect(() => {
    if (isExecuting) {
      simulateExecution();
    } else {
      // Reset all nodes to idle when stopped
      nodes.forEach(node => updateNodeState(node.id, 'idle'));
      setCurrentExecutingNode(null);
      setExecutionProgress(0);
      // setFlowParticles([]);
    }
  }, [isExecuting, simulateExecution, nodes, updateNodeState]);

  return (
    <div className="execution-visualizer">
      {/* Enhanced Node Overlays */}
      <AnimatePresence>
        {Array.from(nodeStates.entries()).map(([nodeId, state]) => {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return null;

          return (
            <motion.div
              key={nodeId}
              className="absolute pointer-events-none"
              style={{
                left: node.position.x - 10,
                top: node.position.y - 10,
                width: 'calc(100% + 20px)',
                height: 'calc(100% + 20px)',
                zIndex: 10,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: state.status !== 'idle' ? 1 : 0,
                scale: state.status === 'processing' ? 1.1 : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Glow Effect - Removed pulsing animation */}

              {/* Border Highlight - Removed rotating animation */}

              {/* Status Badge */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
              >
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium border-2 shadow-lg backdrop-blur-sm",
                    "bg-background/80"
                  )}
                  style={{ borderColor: state.glowColor }}
                >
                  <span className="mr-1" style={{ color: state.glowColor }}>
                    {getStatusIcon(state.status)}
                  </span>
                  {state.status}
                </Badge>
              </motion.div>

              {/* Progress Ring - Removed rotating animation */}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Flow Particles removed for cleaner execution visualization */}

      {/* Execution Controls & Status */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-4 z-30"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-4">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {!isExecuting ? (
              <Button onClick={onStart} size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
            ) : (
              <>
                <Button onClick={onPause} variant="outline" size="sm">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={onStop} variant="outline" size="sm">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            
            <Button onClick={onStepThrough} variant="outline" size="sm" disabled={isExecuting}>
              <Activity className="w-4 h-4 mr-2" />
              Step
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-sm font-medium">Progress:</span>
            <Progress value={executionProgress} className="flex-1" />
            <span className="text-sm text-muted-foreground">{Math.round(executionProgress)}%</span>
          </div>

          {/* Current Node Indicator */}
          {currentExecutingNode && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-sm">
                  Node: <code className="bg-muted px-1 rounded text-xs">{currentExecutingNode}</code>
                </span>
              </div>
            </div>
          )}

          {/* Edge Visibility Toggle */}
          {onToggleHideEdges && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Label htmlFor="hide-edges" className="text-sm cursor-pointer">
                  {hideEdgesDuringExecution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Label>
                <Switch
                  id="hide-edges"
                  checked={hideEdgesDuringExecution}
                  onCheckedChange={onToggleHideEdges}
                  className="scale-75"
                />
                <Label htmlFor="hide-edges" className="text-sm cursor-pointer">
                  Hide connections
                </Label>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
