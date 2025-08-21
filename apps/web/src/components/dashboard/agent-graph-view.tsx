'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, ArrowUp, ArrowDown, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAgentStore } from '@/lib/stores/agent-store';

interface GraphNode {
  id: string;
  agent: any;
  x: number;
  y: number;
  connections: string[];
}

interface GraphConnection {
  from: string;
  to: string;
  type: 'triggers' | 'triggered_by' | 'depends_on';
}

export function AgentGraphView() {
  const { agents, selectedAgent } = useAgentStore();

  const graphData = useMemo(() => {
    if (!agents.length) return { nodes: [], connections: [] };

    const nodes: GraphNode[] = [];
    const connections: GraphConnection[] = [];
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    // Create nodes in a circular layout
    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      nodes.push({
        id: agent.id,
        agent,
        x,
        y,
        connections: [],
      });
    });

    // Create connections based on linked agents
    agents.forEach((agent) => {
      if (agent.linkedAgents) {
        agent.linkedAgents.forEach((linkedAgent) => {
          connections.push({
            from: agent.id,
            to: linkedAgent.id,
            type: linkedAgent.relationship,
          });

          // Add to node connections
          const fromNode = nodes.find(n => n.id === agent.id);
          const toNode = nodes.find(n => n.id === linkedAgent.id);
          if (fromNode && toNode) {
            fromNode.connections.push(linkedAgent.id);
          }
        });
      }
    });

    return { nodes, connections };
  }, [agents]);

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'triggers':
        return 'stroke-green-500';
      case 'triggered_by':
        return 'stroke-blue-500';
      case 'depends_on':
        return 'stroke-orange-500';
      default:
        return 'stroke-gray-400';
    }
  };

  const getConnectionArrow = (type: string) => {
    switch (type) {
      case 'triggers':
        return <ArrowRight className="h-3 w-3 text-green-500" />;
      case 'triggered_by':
        return <ArrowUp className="h-3 w-3 text-blue-500" />;
      case 'depends_on':
        return <ArrowDown className="h-3 w-3 text-orange-500" />;
      default:
        return <ArrowRight className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'inactive':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!agents.length) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No agents available for graph view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-muted/20 rounded-lg border overflow-hidden">
      {/* Graph Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur">
          <LinkIcon className="h-4 w-4 mr-2" />
          {graphData.connections.length} Connections
        </Button>
        <Badge variant="secondary" className="bg-background/80 backdrop-blur">
          {agents.length} Agents
        </Badge>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur rounded-lg p-3 border">
        <p className="text-sm font-medium mb-2">Connection Types</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Triggers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Triggered By</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>Depends On</span>
          </div>
        </div>
      </div>

      {/* SVG Graph */}
      <svg className="w-full h-full" viewBox="0 0 800 600">
        {/* Connections */}
        {graphData.connections.map((connection, index) => {
          const fromNode = graphData.nodes.find(n => n.id === connection.from);
          const toNode = graphData.nodes.find(n => n.id === connection.to);
          
          if (!fromNode || !toNode) return null;

          // Calculate connection path
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          // Adjust start and end points to avoid overlapping with nodes
          const nodeRadius = 30;
          const startX = fromNode.x + Math.cos(angle) * nodeRadius;
          const startY = fromNode.y + Math.sin(angle) * nodeRadius;
          const endX = toNode.x - Math.cos(angle) * nodeRadius;
          const endY = toNode.y - Math.sin(angle) * nodeRadius;

          return (
            <g key={`connection-${index}`}>
              {/* Connection line */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={getConnectionColor(connection.type).replace('stroke-', '')}
                strokeWidth="2"
                strokeDasharray={connection.type === 'depends_on' ? "5,5" : "none"}
                opacity="0.6"
              />
              
              {/* Connection arrow */}
              <g transform={`translate(${endX}, ${endY}) rotate(${angle * 180 / Math.PI})`}>
                {getConnectionArrow(connection.type)}
              </g>
            </g>
          );
        })}

        {/* Nodes */}
        {graphData.nodes.map((node) => (
          <g key={node.id}>
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r="30"
              fill={selectedAgent?.id === node.id ? "rgb(147 51 234 / 0.2)" : "rgb(255 255 255 / 0.9)"}
              stroke={selectedAgent?.id === node.id ? "rgb(147 51 234)" : "rgb(148 163 184)"}
              strokeWidth={selectedAgent?.id === node.id ? "3" : "2"}
              className="cursor-pointer hover:stroke-primary transition-all duration-200"
            />
            
            {/* Status indicator */}
            <circle
              cx={node.x + 20}
              cy={node.y - 20}
              r="6"
              fill={getStatusColor(node.agent.status)}
              className="drop-shadow-sm"
            />
            
            {/* Agent icon */}
            <foreignObject
              x={node.x - 15}
              y={node.y - 15}
              width="30"
              height="30"
              className="pointer-events-none"
            >
              <div className="flex items-center justify-center w-full h-full">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
            </foreignObject>
            
            {/* Agent name */}
            <text
              x={node.x}
              y={node.y + 45}
              textAnchor="middle"
              className="text-xs font-medium fill-foreground"
              style={{ fontSize: '10px' }}
            >
              {node.agent.name.length > 12 
                ? node.agent.name.substring(0, 12) + '...' 
                : node.agent.name
              }
            </text>
            
            {/* Connection count */}
            {node.connections.length > 0 && (
              <>
                <circle
                  cx={node.x - 20}
                  cy={node.y - 20}
                  r="8"
                  fill="rgb(147 51 234)"
                  className="drop-shadow-sm"
                />
                <text
                  x={node.x - 20}
                  y={node.y - 20}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                  style={{ fontSize: '8px' }}
                >
                  {node.connections.length}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>

      {/* Selected Agent Info */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur rounded-lg p-4 border max-w-xs"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">{selectedAgent.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {selectedAgent.description}
          </p>
          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className="text-xs">
              {selectedAgent.type}
            </Badge>
            <span className="text-muted-foreground">
              {selectedAgent.linkedAgents?.length || 0} connections
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
