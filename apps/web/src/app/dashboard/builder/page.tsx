'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  ConnectionMode,
  MarkerType,
  Panel,
  MiniMap,
  getConnectedEdges,
  getOutgoers,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './builder.css';

import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Save,
  Play,
  Download,
  Upload,
  Plus,
  Minus,
  Maximize2,
  Hand,
  MousePointer2,
  Trash2,
  Copy,
  Undo,
  Redo,
  Settings,
  AlignVerticalJustifyCenter,
  StickyNote,
  Zap,
  Info,
  HelpCircle,
  Grid3x3,
  Share2,
  FolderOpen,
  FileText,
  Clock,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Import custom nodes
import EntryNode from '@/components/dashboard/builder/nodes/entry-node';
import LLMNode from '@/components/dashboard/builder/nodes/llm-node';
import ToolNode from '@/components/dashboard/builder/nodes/tool-node';
import RAGNode from '@/components/dashboard/builder/nodes/rag-node';
import VisionNode from '@/components/dashboard/builder/nodes/vision-node';
import VoiceNode from '@/components/dashboard/builder/nodes/voice-node';
import ActionNode from '@/components/dashboard/builder/nodes/action-node';
import ConditionNode from '@/components/dashboard/builder/nodes/condition-node';
import ExitNode from '@/components/dashboard/builder/nodes/exit-node';
import DatabaseNode from '@/components/dashboard/builder/nodes/database-node';
import WebhookNode from '@/components/dashboard/builder/nodes/webhook-node';
import LoopNode from '@/components/dashboard/builder/nodes/loop-node';
import DelayNode from '@/components/dashboard/builder/nodes/delay-node';
import SlackNode from '@/components/dashboard/builder/nodes/slack-node';
import GmailNode from '@/components/dashboard/builder/nodes/gmail-node';
import DiscordNode from '@/components/dashboard/builder/nodes/discord-node';
import HttpNode from '@/components/dashboard/builder/nodes/http-node';
import JsonNode from '@/components/dashboard/builder/nodes/json-node';
import CalendarNode from '@/components/dashboard/builder/nodes/calendar-node';
import RouterNode from '@/components/dashboard/builder/nodes/router-node';
import IteratorNode from '@/components/dashboard/builder/nodes/iterator-node';
import AggregatorNode from '@/components/dashboard/builder/nodes/aggregator-node';
import FlowControlNode from '@/components/dashboard/builder/nodes/flowcontrol-node';
import ToolsNode from '@/components/dashboard/builder/nodes/tools-node';
import SleepNode from '@/components/dashboard/builder/nodes/sleep-node';

// Import sidebar and components
import BuilderSidebar from '@/components/dashboard/builder/builder-sidebar';
import NotesPanel from '@/components/dashboard/builder/notes-panel';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RAGComposer } from '@/components/dashboard/rag-composer';
import type { ContextBasketItem } from '@/components/dashboard/rag-composer/types';

const nodeTypes = {
  entry: EntryNode,
  llm: LLMNode,
  tool: ToolNode,
  rag: RAGNode,
  vision: VisionNode,
  voice: VoiceNode,
  action: ActionNode,
  condition: ConditionNode,
  exit: ExitNode,
  database: DatabaseNode,
  webhook: WebhookNode,
  loop: LoopNode,
  delay: DelayNode,
  slack: SlackNode,
  gmail: GmailNode,
  discord: DiscordNode,
  http: HttpNode,
  json: JsonNode,
  calendar: CalendarNode,
  router: RouterNode,
  iterator: IteratorNode,
  aggregator: AggregatorNode,
  flowControl: FlowControlNode,
  tools: ToolsNode,
  sleep: SleepNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'entry',
    position: { x: 100, y: 100 },
    data: { label: 'Entry' },
  },
  {
    id: '2',
    type: 'llm',
    position: { x: 100, y: 250 },
    data: { 
      label: 'LLM',
      model: 'gpt-4',
      prompt: 'Analyze the user input and determine the intent'
    },
  },
  {
    id: '3',
    type: 'exit',
    position: { x: 100, y: 400 },
    data: { label: 'Exit' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#60a5fa' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#60a5fa',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { stroke: '#60a5fa' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#60a5fa',
    },
  },
];

export default function AgentBuilderPage() {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [interactionMode, setInteractionMode] = useState<'select' | 'pan'>('select');
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(true);
  const [autoAlign, setAutoAlign] = useState(true);
  const [scenarioName, setScenarioName] = useState('Untitled Agent Flow');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRAGComposer, setShowRAGComposer] = useState(false);
  const [selectedRAGNodeId, setSelectedRAGNodeId] = useState<string | null>(null);

  // Initialize history with the initial state
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ nodes: initialNodes, edges: initialEdges }]);
      setHistoryIndex(0);
    }
  }, []);

  // History management
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Validate connection rules
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Connection rules
      const validConnections: Record<string, string[]> = {
        'entry': ['llm', 'tool', 'rag', 'vision', 'voice', 'action', 'condition'],
        'llm': ['tool', 'rag', 'action', 'condition', 'exit', 'llm'],
        'tool': ['llm', 'action', 'condition', 'exit'],
        'rag': ['llm', 'action', 'exit'],
        'vision': ['llm', 'action', 'exit'],
        'voice': ['llm', 'action', 'exit'],
        'action': ['condition', 'exit', 'llm', 'tool'],
        'condition': ['llm', 'tool', 'action', 'exit'],
        'exit': [],
      };
      
      // Check if connection is valid
      const sourceType = sourceNode.type || 'default';
      const targetType = targetNode.type || 'default';
      
      if (!validConnections[sourceType]?.includes(targetType)) {
        toast({
          title: "Invalid Connection",
          description: `Cannot connect ${sourceType} to ${targetType}`,
          variant: "destructive",
        });
        return;
      }
      
      // Check for duplicate connections
      const duplicate = edges.find(
        e => e.source === params.source && e.target === params.target
      );
      
      if (duplicate) {
        toast({
          title: "Connection Exists",
          description: "This connection already exists",
          variant: "destructive",
        });
        return;
      }
      
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#60a5fa' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#60a5fa',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Save to history after connection
      setTimeout(() => saveToHistory(), 100);
    },
    [setEdges, nodes, edges, toast, saveToHistory]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Configure node data based on type
      let nodeData: any = { label: `${type} node` };
      
      switch (type) {
        case 'openai':
        case 'anthropic':
        case 'google':
        case 'llm':
          nodeData = {
            label: 'LLM',
            model: type === 'openai' ? 'gpt-4' : type === 'anthropic' ? 'claude-3' : type === 'google' ? 'gemini-pro' : 'gpt-4',
            prompt: '',
            provider: type === 'llm' ? 'openai' : type
          };
          break;
        case 'slack':
        case 'gmail':
        case 'discord':
        case 'twitter':
        case 'webhook':
          nodeData = {
            label: type.charAt(0).toUpperCase() + type.slice(1),
            configured: false,
            endpoint: '',
          };
          break;
        case 'rag':
          nodeData = {
            label: 'RAG',
            collection: '',
            topK: 5,
            contextItems: 0,
            searchQuery: '',
            template: '',
            filters: {},

          };
          break;
        case 'tool':
          nodeData = {
            label: 'Tool',
            toolName: '',
            parameters: {},
          };
          break;
        case 'database':
          nodeData = {
            label: 'Database',
            query: '',
            connection: '',
          };
          break;
        case 'condition':
          nodeData = {
            label: 'Condition',
            expression: '',
            trueOutput: '',
            falseOutput: '',
          };
          break;
        case 'loop':
          nodeData = {
            label: 'Loop',
            items: [],
            maxIterations: 10,
          };
          break;
        case 'delay':
          nodeData = {
            label: 'Delay',
            duration: 1000,
            unit: 'ms',
          };
          break;
        case 'entry':
          nodeData = {
            label: 'Entry',
            trigger: 'manual',
          };
          break;
        case 'exit':
          nodeData = {
            label: 'Exit',
            status: 'success',
          };
          break;
        case 'http':
          nodeData = {
            label: 'HTTP Request',
            method: 'GET',
            url: '',
            headers: '',
          };
          break;
        case 'json':
          nodeData = {
            label: 'JSON',
            operation: 'parse',
            jsonPath: '',
          };
          break;
        case 'calendar':
          nodeData = {
            label: 'Calendar',
            action: 'create',
            calendar: 'primary',
            title: '',
          };
          break;
        case 'router':
          nodeData = {
            label: 'Router',
            conditions: 2,
          };
          break;
        case 'iterator':
          nodeData = {
            label: 'Iterator',
            arrayPath: '',
            batchSize: 1,
          };
          break;
        case 'aggregator':
          nodeData = {
            label: 'Aggregator',
            operation: 'merge',
            waitForAll: true,
          };
          break;
        case 'flowControl':
          nodeData = {
            label: 'Flow Control',
            action: 'continue',
            filterExpression: '',
          };
          break;
        case 'tools':
          nodeData = {
            label: 'Tools',
            toolType: 'text',
            operation: '',
          };
          break;
        case 'sleep':
          nodeData = {
            label: 'Sleep',
            duration: 1,
            unit: 's',
          };
          break;
        default:
          nodeData = {
            label: type.charAt(0).toUpperCase() + type.slice(1),
          };
      }

      const nodeId = `${type}_${Date.now()}`;
      
      // Add onOpenComposer function for RAG nodes
      if (type === 'rag') {
        nodeData.onOpenComposer = () => {
          setSelectedRAGNodeId(nodeId);
          setShowRAGComposer(true);
        };
      }
      
      const newNode: Node = {
        id: nodeId,
        type: type === 'openai' || type === 'anthropic' || type === 'google' ? 'llm' : type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
      
      toast({
        title: "Node Added",
        description: `Added a new ${type} node to the canvas`,
      });
      
      // Save to history after adding node
      setTimeout(() => saveToHistory(), 100);
    },
    [reactFlowInstance, setNodes, toast, saveToHistory]
  );

  const onSave = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      console.log('Saving flow:', flow);
      
      // Here you would typically save to backend
      localStorage.setItem('agent-flow', JSON.stringify(flow));
      
      toast({
        title: "Agent Saved",
        description: "Your agent flow has been saved successfully",
      });
    }
  };

  const onRestore = () => {
    const restoreFlow = async () => {
      const flow = localStorage.getItem('agent-flow');

      if (flow) {
        const flowData = JSON.parse(flow);
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        
        toast({
          title: "Agent Restored",
          description: "Your agent flow has been restored",
        });
      }
    };

    restoreFlow();
  };

  // Selection handlers
  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    []
  );

  // Delete selected elements
  const onDeleteSelected = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      setNodes((nds) => nds.filter((n) => !selectedNodes.find((sn) => sn.id === n.id)));
      setEdges((eds) => eds.filter((e) => !selectedEdges.find((se) => se.id === e.id)));
      
      toast({
        title: "Elements Deleted",
        description: `Deleted ${selectedNodes.length} nodes and ${selectedEdges.length} edges`,
      });
      
      setSelectedNodes([]);
      setSelectedEdges([]);
      
      // Save to history after deletion
      setTimeout(() => saveToHistory(), 100);
    }
  }, [selectedNodes, selectedEdges, setNodes, setEdges, toast, saveToHistory]);

  // Duplicate selected nodes
  const onDuplicateSelected = useCallback(() => {
    if (selectedNodes.length > 0) {
      const duplicatedNodes = selectedNodes.map((node) => ({
        ...node,
        id: `${node.id}_copy_${Date.now()}`,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
      }));
      
      setNodes((nds) => nds.concat(duplicatedNodes));
      
      toast({
        title: "Nodes Duplicated",
        description: `Duplicated ${selectedNodes.length} nodes`,
      });
      
      // Save to history after duplication
      setTimeout(() => saveToHistory(), 100);
    }
  }, [selectedNodes, setNodes, toast, saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
      
      toast({
        title: "Undo",
        description: "Action undone",
      });
    }
  }, [history, historyIndex, setNodes, setEdges, toast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      
      toast({
        title: "Redo",
        description: "Action redone",
      });
    }
  }, [history, historyIndex, setNodes, setEdges, toast]);

  // Handle node changes with history
  const onNodesChangeWithHistory = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      
      // Save to history after node position changes (drag end)
      const hasPositionChange = changes.some((change: any) => 
        change.type === 'position' && !change.dragging
      );
      
      if (hasPositionChange) {
        setTimeout(() => saveToHistory(), 100);
      }
    },
    [onNodesChange, saveToHistory]
  );

  // Keyboard shortcuts
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Delete
      if ((event.key === 'Delete' || event.key === 'Backspace') && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
        event.preventDefault();
        onDeleteSelected();
      }
      
      // Duplicate
      if ((event.metaKey || event.ctrlKey) && event.key === 'd' && selectedNodes.length > 0) {
        event.preventDefault();
        onDuplicateSelected();
      }
      
      // Undo
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      
      // Redo
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
      }
      
      // Save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        onSave();
      }
      
      // Switch to select mode
      if (event.key === 'v' || event.key === 'V') {
        event.preventDefault();
        setInteractionMode('select');
      }
      
      // Switch to pan mode
      if (event.key === 'h' || event.key === 'H') {
        event.preventDefault();
        setInteractionMode('pan');
      }
    },
    [selectedNodes, selectedEdges, onDeleteSelected, onDuplicateSelected, undo, redo, onSave]
  );

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="sm" className="h-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="bg-transparent border-none outline-none font-medium text-sm w-48 px-1 rounded hover:bg-muted/50 focus:bg-muted"
                placeholder="Scenario name"
              />
            </div>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="flex items-center text-xs text-muted-foreground space-x-4">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Last saved: 2 min ago
              </span>
              <span className="flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Version 1.0
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              {/* Primary action buttons */}
              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={onSave}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save (Cmd+S)</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowNotes(!showNotes)}
                    >
                      <StickyNote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notes</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={undo}
                      disabled={historyIndex <= 0}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo (Cmd+Z)</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo (Cmd+Shift+Z)</TooltipContent>
                </Tooltip>
                
                <div className="h-6 w-px bg-border mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={autoAlign ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAutoAlign(!autoAlign)}
                    >
                      <AlignVerticalJustifyCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Auto-align nodes</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showGrid ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle grid</TooltipContent>
                </Tooltip>
                
                <div className="h-6 w-px bg-border mx-1" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            
            <div className="h-6 w-px bg-border mx-2" />
            
            {/* Run button */}
            <Button 
              size="sm" 
              className="h-8 bg-primary hover:bg-primary/90"
              onClick={() => {
                toast({
                  title: "Running Agent",
                  description: "Your agent is now executing...",
                });
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Run once
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRestore}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import scenario
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export blueprint
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  View logs
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <BuilderSidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChangeWithHistory}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onSelectionChange={onSelectionChange}
              onNodeDoubleClick={(event: React.MouseEvent, node: Node) => {
                if (node.type === 'rag') {
                  setSelectedRAGNodeId(node.id);
                  setShowRAGComposer(true);
                }
              }}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              defaultEdgeOptions={{
                animated: true,
                style: { stroke: '#60a5fa' },
              }}
              fitView
              className="bg-background"
              deleteKeyCode={['Delete', 'Backspace']}
              multiSelectionKeyCode={['Meta', 'Control']}
              selectionOnDrag={interactionMode === 'select'}
              panOnDrag={interactionMode === 'pan'}
              zoomOnDoubleClick={false}
              selectNodesOnDrag={false}
              proOptions={{ hideAttribution: true }}
            >
              {showGrid ? (
                <Background color="#aaa" gap={16} />
              ) : null}
              <Controls 
                className="!bg-background !border !border-border !rounded-lg !bottom-8 !right-8 !shadow-lg"
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              <MiniMap 
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'entry': return '#22c55e';
                    case 'llm': return '#a855f7';
                    case 'tool': return '#3b82f6';
                    case 'rag': return '#f97316';
                    case 'vision': return '#ec4899';
                    case 'voice': return '#0ea5e9';
                    case 'action': return '#eab308';
                    case 'condition': return '#6366f1';
                    case 'exit': return '#ef4444';
                    default: return '#64748b';
                  }
                }}
                className="!bottom-8 !left-8 bg-background border rounded-lg shadow-lg"
                style={{ width: 200, height: 150 }}
                maskColor="rgb(15, 23, 42, 0.6)"
                nodeStrokeWidth={2}
                nodeStrokeColor="#fff"
                nodeBorderRadius={4}
                pannable
                zoomable
              />
              <Panel position="top-center" className="bg-background/80 backdrop-blur border rounded-lg px-4 py-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Nodes: {nodes.length}</span>
                  <span className="text-sm font-medium">Edges: {edges.length}</span>
                  {selectedNodes.length > 0 && (
                    <span className="text-sm font-medium text-primary">
                      Selected: {selectedNodes.length}
                    </span>
                  )}
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        {/* Notes Panel */}
        {showNotes && (
          <NotesPanel
            notes={notes}
            onNotesChange={setNotes}
            onClose={() => setShowNotes(false)}
          />
        )}
        
        {/* RAG Composer Modal */}
        {showRAGComposer && (
          <RAGComposer
            showAsModal
            onClose={() => {
              setShowRAGComposer(false);
              setSelectedRAGNodeId(null);
            }}
            onExecuteWithAgent={(agentId, context) => {
              // Update the RAG node with context information
              if (selectedRAGNodeId) {
                setNodes((nds) =>
                  nds.map((node) => {
                    if (node.id === selectedRAGNodeId && node.type === 'rag') {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          contextItems: context.length,
                          searchQuery: context[0]?.chunk.metadata.title || '',
                          // Keep the onOpenComposer function
                          onOpenComposer: () => {
                            setSelectedRAGNodeId(node.id);
                            setShowRAGComposer(true);
                          },
                        },
                      };
                    }
                    return node;
                  })
                );
              }
              setShowRAGComposer(false);
              setSelectedRAGNodeId(null);
              toast({
                title: 'RAG Context Applied',
                description: `${context.length} chunks added to the RAG node`,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
