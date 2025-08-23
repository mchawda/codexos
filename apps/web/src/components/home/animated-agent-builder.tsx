// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bot, Code2, Cpu, Sparkles, Zap, Globe, Database, Terminal, GitBranch, Server, Lock, Eye, Brain, Workflow, Zap as Lightning } from 'lucide-react';

interface AgentNode {
  id: string;
  type: 'input' | 'process' | 'output';
  icon: React.ComponentType<any>;
  label: string;
  x: number;
  y: number;
  status: 'idle' | 'processing' | 'success' | 'error';
  color: string;
  size: number;
}

export default function AnimatedAgentBuilder() {
  const [nodes, setNodes] = useState<AgentNode[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [executionStep, setExecutionStep] = useState(0);

  useEffect(() => {
    // Initialize nodes with modern, spacious layout
    const initialNodes: AgentNode[] = [
      { id: 'input', type: 'input', icon: Eye, label: 'Input', x: 60, y: 120, status: 'idle', color: 'from-blue-500 to-cyan-500', size: 56 },
      { id: 'process1', type: 'process', icon: Brain, label: 'Process', x: 260, y: 80, status: 'idle', color: 'from-purple-500 to-pink-500', size: 56 },
      { id: 'process2', type: 'process', icon: Database, label: 'Query', x: 260, y: 180, status: 'idle', color: 'from-green-500 to-emerald-500', size: 56 },
      { id: 'process3', type: 'process', icon: Workflow, label: 'Execute', x: 460, y: 130, status: 'idle', color: 'from-orange-500 to-red-500', size: 56 },
      { id: 'output', type: 'output', icon: Bot, label: 'Result', x: 660, y: 130, status: 'idle', color: 'from-indigo-500 to-purple-500', size: 56 },
    ];

    setNodes(initialNodes);

    // Start execution animation
    const interval = setInterval(() => {
      setExecutionStep((prev) => (prev + 1) % 5);
    }, 2500);

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

      // Reset after animation
      setTimeout(() => {
        setActiveNode(null);
      }, 2000);
    };

    executeStep();
  }, [executionStep]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'animate-pulse shadow-lg shadow-blue-500/50';
      case 'success': return 'animate-bounce shadow-lg shadow-green-500/50';
      case 'error': return 'animate-shake shadow-lg shadow-red-500/50';
      default: return '';
    }
  };

  return (
    <div className="relative h-[500px] lg:h-[650px] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,119,198,0.15),transparent_40%)] animate-spin" style={{ animationDuration: '25s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.1),transparent_40%)] animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-foreground/30 rounded-full"
          animate={{
            x: [0, 150, 0],
            y: [0, -150, 0],
            opacity: [0.1, 0.8, 0.1],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          style={{
            left: `${15 + (i * 3) % 85}%`,
            top: `${15 + (i * 2) % 70}%`,
            zIndex: 5
          }}
        />
      ))}

      {/* Agent Nodes with enhanced styling */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className={`absolute flex items-center justify-center cursor-pointer transition-all duration-700 ${
            activeNode === node.id ? 'scale-110' : 'scale-100'
          }`}
          style={{ 
            left: node.x, 
            top: node.y, 
            width: node.size,
            height: node.size,
            zIndex: activeNode === node.id ? 100 : 50 
          }}
          initial={{ opacity: 0, scale: 0, y: 50 }}
          animate={{ 
            opacity: 1, 
            scale: activeNode === node.id ? 1.1 : 1,
            y: activeNode === node.id ? node.y - 8 : node.y
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.05, y: node.y - 3 }}
        >
          <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${node.color} flex items-center justify-center shadow-2xl ${getStatusColor(node.status)} relative z-10 border border-border/20`}>
            <node.icon className={`${node.size === 56 ? 'w-7 h-7' : 'w-6 h-6'} text-white`} />
          </div>
          
          {/* Enhanced Node Label */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-sm text-foreground/70 font-medium whitespace-nowrap bg-background/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {node.label}
          </div>

          {/* Enhanced Status Indicator */}
          {node.status === 'processing' && (
            <motion.div
              className="absolute -top-3 -right-3 w-5 h-5 bg-blue-400 rounded-full border-2 border-background"
              animate={{ 
                scale: [1, 1.3, 1],
                boxShadow: ["0 0 0 0 rgba(96, 165, 250, 0.7)", "0 0 0 10px rgba(96, 165, 250, 0)", "0 0 0 0 rgba(96, 165, 250, 0)"]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Success indicator */}
          {node.status === 'success' && (
            <motion.div
              className="absolute -top-3 -right-3 w-5 h-5 bg-green-400 rounded-full border-2 border-background flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-2 h-2 bg-background rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Enhanced Data Flow Animation */}
      <motion.div
        className="absolute w-4 h-4 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
        animate={{
          x: [88, 288, 488, 688], // Adjusted to center of new icon positions
          y: [148, 108, 158, 158], // Adjusted to center of new icon positions
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ zIndex: 30 }}
      />

      {/* Additional Flow Indicators */}
      <motion.div
        className="absolute w-2 h-2 bg-blue-300 rounded-full"
        animate={{
          x: [88, 288, 488, 688],
          y: [148, 108, 158, 158],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        style={{ zIndex: 25 }}
      />

      <motion.div
        className="absolute w-1.5 h-1.5 bg-blue-200 rounded-full"
        animate={{
          x: [88, 288, 488, 688],
          y: [148, 108, 158, 158],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{ zIndex: 20 }}
      />

      {/* Enhanced Floating Code Blocks */}
      <motion.div
        className="absolute top-24 right-24 text-sm font-mono text-foreground/50 bg-background/10 p-4 rounded-xl border border-border/20 backdrop-blur-sm shadow-xl"
        animate={{ y: [0, -15, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ zIndex: 35 }}
      >
        <div className="text-blue-300">const agent = new AIAgent()</div>
        <div className="text-purple-300">agent.process(input)</div>
      </motion.div>

      <motion.div
        className="absolute bottom-36 left-24 text-sm font-mono text-foreground/50 bg-background/10 p-4 rounded-xl border border-border/20 backdrop-blur-sm shadow-xl"
        animate={{ y: [0, 15, 0], rotate: [0, -1, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        style={{ zIndex: 35 }}
      >
        <div className="text-green-300">if (success) {`{`}</div>
        <div className="text-orange-300">  return result</div>
        <div className="text-green-300">{`}`}</div>
      </motion.div>

      {/* Enhanced Performance Metrics */}
      <div className="absolute top-8 right-8 flex items-center gap-3 text-sm text-foreground/70 bg-background/20 px-4 py-2 rounded-full backdrop-blur-sm border border-border/20">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span>Processing: {executionStep + 1}/5</span>
      </div>

      {/* Live Execution Badge */}
      <div className="absolute top-8 left-8 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium border border-border/20 z-10 bg-blue-500/20 backdrop-blur-sm">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-foreground">Live Execution</span>
      </div>
    </div>
  );
}
