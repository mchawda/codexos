// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bot, Code2, Cpu, Sparkles, Zap, Globe, Database, Terminal, GitBranch, Server, Lock, Eye } from 'lucide-react';

interface AgentNode {
  id: string;
  type: 'input' | 'process' | 'output';
  icon: React.ComponentType<any>;
  label: string;
  x: number;
  y: number;
  status: 'idle' | 'processing' | 'success' | 'error';
  color: string;
}

interface Connection {
  from: string;
  to: string;
  status: 'idle' | 'active' | 'success';
}

export default function AnimatedAgentBuilder() {
  const [nodes, setNodes] = useState<AgentNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [executionStep, setExecutionStep] = useState(0);

  useEffect(() => {
    // Initialize nodes
    const initialNodes: AgentNode[] = [
      { id: 'input', type: 'input', icon: Eye, label: 'Input', x: 50, y: 100, status: 'idle', color: 'from-blue-500 to-cyan-500' },
      { id: 'process1', type: 'process', icon: Cpu, label: 'Process', x: 200, y: 80, status: 'idle', color: 'from-purple-500 to-pink-500' },
      { id: 'process2', type: 'process', icon: Database, label: 'Query', x: 200, y: 140, status: 'idle', color: 'from-green-500 to-emerald-500' },
      { id: 'process3', type: 'process', icon: Terminal, label: 'Execute', x: 350, y: 110, status: 'idle', color: 'from-orange-500 to-red-500' },
      { id: 'output', type: 'output', icon: Bot, label: 'Result', x: 500, y: 110, status: 'idle', color: 'from-indigo-500 to-purple-500' },
    ];

    const initialConnections: Connection[] = [
      { from: 'input', to: 'process1', status: 'idle' },
      { from: 'input', to: 'process2', status: 'idle' },
      { from: 'process1', to: 'process3', status: 'idle' },
      { from: 'process2', to: 'process3', status: 'idle' },
      { from: 'process3', to: 'output', status: 'idle' },
    ];

    setNodes(initialNodes);
    setConnections(initialConnections);

    // Start execution animation
    const interval = setInterval(() => {
      setExecutionStep((prev) => (prev + 1) % 5);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate execution flow
    const executeStep = async () => {
      const stepOrder = ['input', 'process1', 'process2', 'process3', 'output'];
      const currentStep = stepOrder[executionStep];
      
      setActiveNode(currentStep);
      
      // Update node status
      setNodes(prev => prev.map(node => ({
        ...node,
        status: node.id === currentStep ? 'processing' : 
                stepOrder.indexOf(node.id) < executionStep ? 'success' : 'idle'
      })));

      // Update connections
      setConnections(prev => prev.map(conn => ({
        ...conn,
        status: (conn.from === currentStep || conn.to === currentStep) ? 'active' : 
                stepOrder.indexOf(conn.from) < executionStep ? 'success' : 'idle'
      })));

      // Reset after animation
      setTimeout(() => {
        setActiveNode(null);
      }, 1500);
    };

    executeStep();
  }, [executionStep]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'animate-pulse';
      case 'success': return 'animate-bounce';
      case 'error': return 'animate-shake';
      default: return '';
    }
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-400';
      case 'success': return 'bg-green-400';
      default: return 'bg-white/20';
    }
  };

  return (
    <div className="relative h-[500px] lg:h-[650px] bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] animate-spin" style={{ animationDuration: '20s' }} />
      </div>

      {/* SVG Layer for connections - absolute positioning with low z-index */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(96, 165, 250, 0.3)" />
            <stop offset="100%" stopColor="rgba(96, 165, 250, 0.8)" />
          </linearGradient>
          <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0.8)" />
          </linearGradient>
        </defs>
        <g>
          {connections.map((conn, index) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            
            if (!fromNode || !toNode) return null;

            const gradientId = conn.status === 'active' ? 'blue-gradient' : 
                             conn.status === 'success' ? 'green-gradient' : null;

            return (
              <motion.line
                key={index}
                x1={fromNode.x + 25}
                y1={fromNode.y + 25}
                x2={toNode.x + 25}
                y2={toNode.y + 25}
                stroke={gradientId ? `url(#${gradientId})` : "rgba(255, 255, 255, 0.2)"}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: conn.status === 'active' ? 1 : 0.3,
                  opacity: conn.status === 'active' ? 1 : 0.3
                }}
                transition={{ duration: 0.5 }}
              />
            );
          })}
        </g>
      </svg>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          style={{
            left: `${20 + (i * 4) % 80}%`,
            top: `${20 + (i * 3) % 60}%`,
            zIndex: 5
          }}
        />
      ))}

      {/* Agent Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className={`absolute w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-500 ${
            activeNode === node.id ? 'scale-110' : 'scale-100'
          }`}
          style={{ 
            left: node.x, 
            top: node.y, 
            zIndex: activeNode === node.id ? 100 : 50 
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: activeNode === node.id ? 1.1 : 1,
            y: activeNode === node.id ? node.y - 5 : node.y
          }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className={`w-full h-full rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg ${getStatusColor(node.status)} relative z-10`}>
            <node.icon className="w-5 h-5 text-white" />
          </div>
          
          {/* Node Label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/60 font-medium whitespace-nowrap">
            {node.label}
          </div>

          {/* Status Indicator */}
          {node.status === 'processing' && (
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}

      {/* Data Flow Animation */}
      <motion.div
        className="absolute w-2 h-2 bg-blue-400 rounded-full"
        animate={{
          x: [50, 200, 350, 500],
          y: [100, 80, 110, 110],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ zIndex: 30 }}
      />

      {/* Floating Code Blocks */}
      <motion.div
        className="absolute top-20 right-20 text-xs font-mono text-white/40 bg-white/5 p-2 rounded border border-white/10"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ zIndex: 35 }}
      >
        <div>const agent = new AIAgent()</div>
        <div>agent.process(input)</div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-20 text-xs font-mono text-white/40 bg-white/5 p-2 rounded border border-white/10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        <div>if (success) {`{`}</div>
        <div>  return result</div>
        <div>{`}`}</div>
      </motion.div>

      {/* Performance Metrics */}
      <div className="absolute top-8 right-8 flex items-center gap-2 text-xs text-white/60">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span>Processing: {executionStep + 1}/5</span>
      </div>
    </div>
  );
}
