'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  Node,
  NodeChange,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import NodeMenu from './node-menu';
import EntryNode from './nodes/entry-node';
import LLMNode from './nodes/llm-node';
import ToolNode from './nodes/tool-node';
import RAGNode from './nodes/rag-node';
import VisionNode from './nodes/vision-node';
import VoiceNode from './nodes/voice-node';
import ActionNode from './nodes/action-node';
import ConditionNode from './nodes/condition-node';
import ExitNode from './nodes/exit-node';

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
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'entry',
    position: { x: 250, y: 50 },
    data: { label: 'Start' },
  },
  {
    id: '2',
    type: 'llm',
    position: { x: 250, y: 150 },
    data: { 
      label: 'Process Input',
      model: 'gpt-4',
      prompt: 'Analyze the user input and determine the intent',
    },
  },
  {
    id: '3',
    type: 'exit',
    position: { x: 250, y: 350 },
    data: { label: 'End' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
  },
];

function FlowEditorContent() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { project } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="opacity-50"
        />
        <Controls 
          className="bg-background border-border"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-background border-border"
          nodeColor={(node) => {
            switch (node.type) {
              case 'entry': return '#22c55e';
              case 'exit': return '#ef4444';
              case 'llm': return '#8b5cf6';
              case 'tool': return '#3b82f6';
              case 'rag': return '#f59e0b';
              case 'vision': return '#ec4899';
              case 'voice': return '#14b8a6';
              case 'action': return '#f97316';
              case 'condition': return '#6366f1';
              default: return '#94a3b8';
            }
          }}
        />
        
        <Panel position="top-left" className="bg-transparent">
          <NodeMenu />
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorContent />
    </ReactFlowProvider>
  );
}
