// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Bot,
  RefreshCw,
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
import TriggerAgentNode from '@/components/dashboard/builder/nodes/trigger-agent-node';

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
import { AIScaffoldChat } from '@/components/dashboard/builder/ai-scaffold-chat';

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
  triggerAgent: TriggerAgentNode,
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
  const searchParams = useSearchParams();
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
  const [showAIScaffold, setShowAIScaffold] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [autoSave, setAutoSave] = useState(true);

  // Load agent if agentId is provided in URL
  useEffect(() => {
    const agentId = searchParams.get('agentId');
    if (agentId) {
      // Simulate loading agent data based on ID
      // In a real implementation, this would fetch from the backend
      
      if (agentId === '1') {
        // Code Review Assistant flow
        const codeReviewNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'Pull Request Webhook' },
          },
          {
            id: 'rag_1',
            type: 'rag',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Fetch Codebase Context',
              query: 'Retrieve relevant code standards and patterns',
              collections: ['code-standards', 'best-practices'],
              topK: 10,
              threshold: 0.7,
              includeMetadata: true,
              onOpenComposer: () => {
                setSelectedRAGNodeId('rag_1');
                setShowRAGComposer(true);
              },
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            position: { x: 250, y: 300 },
            data: { 
              label: 'Code Analysis',
              model: 'gpt-4',
              prompt: `Analyze the pull request changes:
- Check for code quality issues
- Verify adherence to coding standards
- Identify potential bugs or security issues
- Suggest improvements
- Consider the codebase context from RAG

Pull Request: {{pull_request_data}}
Codebase Context: {{rag_context}}`,
              temperature: 0.2,
              maxTokens: 2000,
            },
          },
          {
            id: 'condition_1',
            type: 'condition',
            position: { x: 250, y: 450 },
            data: { 
              label: 'Check Severity',
              condition: 'severity',
              operator: 'equals',
              value: 'high',
            },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 100, y: 600 },
            data: { 
              label: 'Post GitHub Comment',
              toolType: 'github',
              action: 'comment',
              repository: '{{repo_name}}',
              pullRequest: '{{pr_number}}',
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 400, y: 600 },
            data: { 
              label: 'Approve PR',
              toolType: 'github',
              action: 'approve',
              repository: '{{repo_name}}',
              pullRequest: '{{pr_number}}',
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 750 },
            data: { label: 'Complete Review' },
          },
        ];

        const codeReviewEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'rag_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'rag_1',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-4',
            source: 'llm_1',
            target: 'condition_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'condition_1',
            sourceHandle: 'false',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#ef4444' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444',
            },
            label: 'Issues Found',
            labelStyle: { fill: '#ef4444', fontWeight: 700 },
          },
          {
            id: 'e4-6',
            source: 'condition_1',
            sourceHandle: 'true',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'No Issues',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e5-7',
            source: 'tool_1',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e6-7',
            source: 'tool_2',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(codeReviewNodes);
        setEdges(codeReviewEdges);
        setScenarioName('Code Review Assistant');
        
        toast({
          title: "Agent Loaded",
          description: "Code Review Assistant flow loaded successfully",
        });
      } else if (agentId === '2') {
        // Documentation Generator flow
        const docGenNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'Code Change Trigger' },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Parse Code Files',
              toolType: 'file',
              action: 'read',
              path: '{{changed_files}}',
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            position: { x: 250, y: 300 },
            data: { 
              label: 'Generate Documentation',
              model: 'gpt-4',
              prompt: `Generate comprehensive API documentation for the following code:

Code: {{parsed_code}}

Include:
- Function/Method signatures
- Parameters and return types
- Usage examples
- Edge cases and error handling`,
              temperature: 0.3,
              maxTokens: 3000,
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 250, y: 450 },
            data: { 
              label: 'Update Docs Files',
              toolType: 'file',
              action: 'write',
              path: 'docs/api/{{filename}}.md',
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 600 },
            data: { label: 'Documentation Updated' },
          },
        ];

        const docGenEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'tool_1',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-4',
            source: 'llm_1',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'tool_2',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(docGenNodes);
        setEdges(docGenEdges);
        setScenarioName('Documentation Generator');
        
        toast({
          title: "Agent Loaded",
          description: "Documentation Generator flow loaded successfully",
        });
      } else if (agentId === '3') {
        // Bug Triager flow
        const bugTriagerNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'New Bug Report' },
          },
          {
            id: 'rag_1',
            type: 'rag',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Search Similar Issues',
              query: 'Find similar bug reports and resolutions',
              collections: ['bug-history', 'known-issues'],
              topK: 5,
              threshold: 0.8,
              includeMetadata: true,
              onOpenComposer: () => {
                setSelectedRAGNodeId('rag_1');
                setShowRAGComposer(true);
              },
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            position: { x: 250, y: 300 },
            data: { 
              label: 'Analyze Bug Report',
              model: 'gpt-4',
              prompt: `Analyze the bug report and categorize it:

Bug Report: {{bug_report}}
Similar Issues: {{similar_issues}}

Determine:
1. Severity (Critical/High/Medium/Low)
2. Category (UI/Backend/Performance/Security/Other)
3. Affected Components
4. Suggested Priority
5. Potential Duplicate of existing issue`,
              temperature: 0.1,
              maxTokens: 1000,
            },
          },
          {
            id: 'router_1',
            type: 'router',
            position: { x: 250, y: 450 },
            data: { 
              label: 'Route by Severity',
              routes: [
                { condition: 'severity === "Critical"', label: 'Critical' },
                { condition: 'severity === "High"', label: 'High' },
                { condition: 'default', label: 'Normal' },
              ],
            },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 50, y: 600 },
            data: { 
              label: 'Alert Team',
              toolType: 'slack',
              action: 'message',
              channel: '#critical-bugs',
              message: 'Critical bug reported: {{bug_summary}}',
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 250, y: 600 },
            data: { 
              label: 'Create Issue',
              toolType: 'github',
              action: 'create_issue',
              repository: '{{repo_name}}',
              title: '{{bug_title}}',
              labels: ['{{severity}}', '{{category}}'],
            },
          },
          {
            id: 'tool_3',
            type: 'tool',
            position: { x: 450, y: 600 },
            data: { 
              label: 'Add to Backlog',
              toolType: 'jira',
              action: 'create_ticket',
              project: 'BUGS',
              priority: 'Low',
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 750 },
            data: { label: 'Bug Triaged' },
          },
        ];

        const bugTriagerEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'rag_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'rag_1',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-4',
            source: 'llm_1',
            target: 'router_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'router_1',
            sourceHandle: 'route-0',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#ef4444' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444',
            },
            label: 'Critical',
            labelStyle: { fill: '#ef4444', fontWeight: 700 },
          },
          {
            id: 'e4-6',
            source: 'router_1',
            sourceHandle: 'route-1',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#f59e0b' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f59e0b',
            },
            label: 'High',
            labelStyle: { fill: '#f59e0b', fontWeight: 700 },
          },
          {
            id: 'e4-7',
            source: 'router_1',
            sourceHandle: 'route-2',
            target: 'tool_3',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'Normal',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e5-8',
            source: 'tool_1',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e6-8',
            source: 'tool_2',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e7-8',
            source: 'tool_3',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(bugTriagerNodes);
        setEdges(bugTriagerEdges);
        setScenarioName('Bug Triager');
        
        toast({
          title: "Agent Loaded",
          description: "Bug Triager flow loaded successfully",
        });
      } else if (agentId === '4') {
        // Dependency Updater flow
        const depUpdaterNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'Scheduled Trigger' },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Check Dependencies',
              toolType: 'npm',
              action: 'outdated',
              path: '{{project_path}}',
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            position: { x: 250, y: 300 },
            data: { 
              label: 'Analyze Updates',
              model: 'gpt-4',
              prompt: `Analyze the outdated dependencies and determine safe updates:

Outdated Dependencies: {{outdated_deps}}

For each dependency:
1. Check if it's a major, minor, or patch update
2. Review breaking changes in release notes
3. Assess risk level (low/medium/high)
4. Check for security vulnerabilities
5. Recommend update strategy

Prioritize:
- Security updates (always update)
- Patch updates (usually safe)
- Minor updates (check compatibility)
- Major updates (require careful review)`,
              temperature: 0.2,
              maxTokens: 2000,
            },
          },
          {
            id: 'condition_1',
            type: 'condition',
            position: { x: 250, y: 450 },
            data: { 
              label: 'Has Critical Updates?',
              condition: 'hasCriticalUpdates',
              operator: 'equals',
              value: true,
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 100, y: 600 },
            data: { 
              label: 'Update Dependencies',
              toolType: 'npm',
              action: 'update',
              packages: '{{safe_updates}}',
              flags: '--save-exact',
            },
          },
          {
            id: 'tool_3',
            type: 'tool',
            position: { x: 400, y: 600 },
            data: { 
              label: 'Create PR',
              toolType: 'github',
              action: 'create_pr',
              title: 'chore: Update dependencies',
              body: '{{update_summary}}',
              branch: 'deps/update-{{date}}',
            },
          },
          {
            id: 'tool_4',
            type: 'tool',
            position: { x: 250, y: 750 },
            data: { 
              label: 'Run Tests',
              toolType: 'npm',
              action: 'test',
              script: 'test:all',
            },
          },
          {
            id: 'condition_2',
            type: 'condition',
            position: { x: 250, y: 900 },
            data: { 
              label: 'Tests Pass?',
              condition: 'testsPass',
              operator: 'equals',
              value: true,
            },
          },
          {
            id: 'tool_5',
            type: 'tool',
            position: { x: 100, y: 1050 },
            data: { 
              label: 'Notify Team',
              toolType: 'slack',
              action: 'message',
              channel: '#dev-alerts',
              message: '⚠️ Dependency update failed tests: {{test_results}}',
            },
          },
          {
            id: 'tool_6',
            type: 'tool',
            position: { x: 400, y: 1050 },
            data: { 
              label: 'Merge PR',
              toolType: 'github',
              action: 'merge_pr',
              pr_number: '{{pr_number}}',
              merge_method: 'squash',
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 1200 },
            data: { label: 'Update Complete' },
          },
        ];

        const depUpdaterEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'tool_1',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-4',
            source: 'llm_1',
            target: 'condition_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'condition_1',
            sourceHandle: 'true',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'Yes',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e4-6',
            source: 'condition_1',
            sourceHandle: 'false',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#6b7280' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#6b7280',
            },
            label: 'No Updates',
            labelStyle: { fill: '#6b7280', fontWeight: 700 },
          },
          {
            id: 'e5-6',
            source: 'tool_2',
            target: 'tool_3',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e6-7',
            source: 'tool_3',
            target: 'tool_4',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e7-8',
            source: 'tool_4',
            target: 'condition_2',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e8-9',
            source: 'condition_2',
            sourceHandle: 'false',
            target: 'tool_5',
            animated: true,
            style: { stroke: '#ef4444' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444',
            },
            label: 'Failed',
            labelStyle: { fill: '#ef4444', fontWeight: 700 },
          },
          {
            id: 'e8-10',
            source: 'condition_2',
            sourceHandle: 'true',
            target: 'tool_6',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'Passed',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e9-11',
            source: 'tool_5',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e10-11',
            source: 'tool_6',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(depUpdaterNodes);
        setEdges(depUpdaterEdges);
        setScenarioName('Dependency Updater');
        
        toast({
          title: "Agent Loaded",
          description: "Dependency Updater flow loaded successfully",
        });
      } else if (agentId === '6') {
        // Code Review Assistant Pro flow (enhanced version)
        const codeReviewProNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'PR/Commit Webhook' },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Fetch Code Changes',
              toolType: 'git',
              action: 'diff',
              repository: '{{repo_url}}',
              commit: '{{commit_hash}}',
            },
          },
          {
            id: 'rag_1',
            type: 'rag',
            position: { x: 100, y: 250 },
            data: { 
              label: 'Load Code Standards',
              query: 'Retrieve coding standards, best practices, and security guidelines',
              collections: ['code-standards', 'security-rules', 'architecture-patterns'],
              topK: 15,
              threshold: 0.8,
              includeMetadata: true,
              onOpenComposer: () => {
                setSelectedRAGNodeId('rag_1');
                setShowRAGComposer(true);
              },
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 400, y: 250 },
            data: { 
              label: 'Security Scan',
              toolType: 'semgrep',
              action: 'scan',
              rules: 'auto',
              severity: 'all',
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            position: { x: 250, y: 400 },
            data: { 
              label: 'Advanced Code Analysis',
              model: 'gpt-4',
              prompt: `Perform comprehensive code review:

Code Changes: {{code_diff}}
Security Scan Results: {{security_results}}
Coding Standards: {{standards}}

Analyze for:
1. Code quality and maintainability
2. Security vulnerabilities (OWASP Top 10)
3. Performance optimizations
4. Architecture and design patterns
5. Test coverage requirements
6. Documentation completeness

Provide actionable feedback with severity levels.`,
              temperature: 0.1,
              maxTokens: 4000,
            },
          },
          {
            id: 'llm_2',
            type: 'llm',
            position: { x: 250, y: 550 },
            data: { 
              label: 'Generate Suggestions',
              model: 'gpt-4',
              prompt: `Based on the analysis, generate specific code improvements:

Analysis: {{code_analysis}}

For each issue found:
1. Provide exact code fix
2. Explain why it's important
3. Show before/after examples
4. Include relevant documentation links`,
              temperature: 0.3,
              maxTokens: 3000,
            },
          },
          {
            id: 'condition_1',
            type: 'condition',
            position: { x: 250, y: 700 },
            data: { 
              label: 'Auto-Approve?',
              condition: 'issues_count',
              operator: 'equals',
              value: 0,
            },
          },
          {
            id: 'tool_3',
            type: 'tool',
            position: { x: 100, y: 850 },
            data: { 
              label: 'Post Review Comments',
              toolType: 'github',
              action: 'review',
              pullRequest: '{{pr_number}}',
              comments: '{{review_comments}}',
              status: 'REQUEST_CHANGES',
            },
          },
          {
            id: 'tool_4',
            type: 'tool',
            position: { x: 400, y: 850 },
            data: { 
              label: 'Approve & Merge',
              toolType: 'github',
              action: 'approve',
              pullRequest: '{{pr_number}}',
              message: '✅ All checks passed! Code meets quality standards.',
              autoMerge: true,
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 1000 },
            data: { label: 'Review Complete' },
          },
        ];

        const codeReviewProEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'tool_1',
            target: 'rag_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-4',
            source: 'tool_1',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-5',
            source: 'rag_1',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'tool_2',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e5-6',
            source: 'llm_1',
            target: 'llm_2',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e6-7',
            source: 'llm_2',
            target: 'condition_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e7-8',
            source: 'condition_1',
            sourceHandle: 'false',
            target: 'tool_3',
            animated: true,
            style: { stroke: '#f59e0b' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f59e0b',
            },
            label: 'Has Issues',
            labelStyle: { fill: '#f59e0b', fontWeight: 700 },
          },
          {
            id: 'e7-9',
            source: 'condition_1',
            sourceHandle: 'true',
            target: 'tool_4',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'No Issues',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e8-10',
            source: 'tool_3',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e9-10',
            source: 'tool_4',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(codeReviewProNodes);
        setEdges(codeReviewProEdges);
        setScenarioName('Code Review Assistant Pro');
        
        toast({
          title: "Agent Loaded",
          description: "Code Review Assistant Pro flow loaded successfully",
        });
      } else if (agentId === '5') {
        // AI Customer Support Agent flow
        const customerSupportNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'Support Ticket Received' },
          },
          {
            id: 'rag_1',
            type: 'rag',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Search Knowledge Base',
              query: 'Find relevant support articles and previous resolutions',
              collections: ['support-kb', 'resolved-tickets'],
              topK: 5,
              threshold: 0.75,
              includeMetadata: true,
              onOpenComposer: () => {
                setSelectedRAGNodeId('rag_1');
                setShowRAGComposer(true);
              },
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            position: { x: 250, y: 300 },
            data: { 
              label: 'Analyze & Generate Response',
              model: 'gpt-4',
              prompt: `Analyze the customer support ticket and generate a helpful response:

Customer Query: {{ticket_content}}
Customer History: {{customer_history}}
Knowledge Base: {{kb_results}}

Generate a response that:
1. Acknowledges the customer's issue
2. Provides a clear solution or next steps
3. Is friendly and professional
4. Includes relevant links or references`,
              temperature: 0.7,
              maxTokens: 1500,
            },
          },
          {
            id: 'condition_1',
            type: 'condition',
            position: { x: 250, y: 450 },
            data: { 
              label: 'Requires Human?',
              condition: 'confidence',
              operator: 'less_than',
              value: 0.8,
            },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 100, y: 600 },
            data: { 
              label: 'Escalate to Human',
              toolType: 'zendesk',
              action: 'assign_agent',
              priority: 'high',
              tag: 'ai-escalated',
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 400, y: 600 },
            data: { 
              label: 'Send Response',
              toolType: 'email',
              action: 'send',
              to: '{{customer_email}}',
              subject: 'Re: {{ticket_subject}}',
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 750 },
            data: { label: 'Ticket Handled' },
          },
        ];

        const customerSupportEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'rag_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'rag_1',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-4',
            source: 'llm_1',
            target: 'condition_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'condition_1',
            sourceHandle: 'true',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#f59e0b' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f59e0b',
            },
            label: 'Low Confidence',
            labelStyle: { fill: '#f59e0b', fontWeight: 700 },
          },
          {
            id: 'e4-6',
            source: 'condition_1',
            sourceHandle: 'false',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'High Confidence',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e5-7',
            source: 'tool_1',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e6-7',
            source: 'tool_2',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(customerSupportNodes);
        setEdges(customerSupportEdges);
        setScenarioName('AI Customer Support Agent');
        
        toast({
          title: "Agent Loaded",
          description: "AI Customer Support Agent flow loaded successfully",
        });
      } else if (agentId === '7') {
        // Data Pipeline Orchestrator flow
        const dataPipelineNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'Pipeline Schedule Trigger' },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Extract from Source',
              toolType: 'database',
              action: 'query',
              source: 'production_db',
              query: 'SELECT * FROM transactions WHERE date >= {{last_run}}',
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 250, y: 250 },
            data: { 
              label: 'Transform Data',
              toolType: 'python',
              action: 'execute',
              script: 'transform_pipeline.py',
              params: '{{raw_data}}',
            },
          },
          {
            id: 'condition_1',
            type: 'condition',
            position: { x: 250, y: 350 },
            data: { 
              label: 'Data Quality Check',
              condition: 'quality_score',
              operator: 'greater_than',
              value: 0.95,
            },
          },
          {
            id: 'tool_3',
            type: 'tool',
            position: { x: 100, y: 500 },
            data: { 
              label: 'Alert Data Team',
              toolType: 'slack',
              action: 'message',
              channel: '#data-quality',
              message: '⚠️ Data quality issues detected: {{quality_report}}',
            },
          },
          {
            id: 'tool_4',
            type: 'tool',
            position: { x: 400, y: 500 },
            data: { 
              label: 'Load to Warehouse',
              toolType: 'bigquery',
              action: 'insert',
              dataset: 'analytics',
              table: 'processed_transactions',
            },
          },
          {
            id: 'tool_5',
            type: 'tool',
            position: { x: 400, y: 650 },
            data: { 
              label: 'Update Dashboard',
              toolType: 'tableau',
              action: 'refresh',
              dashboard: 'executive_metrics',
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 800 },
            data: { label: 'Pipeline Complete' },
          },
        ];

        const dataPipelineEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'tool_1',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-4',
            source: 'tool_2',
            target: 'condition_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'condition_1',
            sourceHandle: 'false',
            target: 'tool_3',
            animated: true,
            style: { stroke: '#ef4444' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444',
            },
            label: 'Failed QC',
            labelStyle: { fill: '#ef4444', fontWeight: 700 },
          },
          {
            id: 'e4-6',
            source: 'condition_1',
            sourceHandle: 'true',
            target: 'tool_4',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'Passed QC',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e5-8',
            source: 'tool_3',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e6-7',
            source: 'tool_4',
            target: 'tool_5',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e7-8',
            source: 'tool_5',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(dataPipelineNodes);
        setEdges(dataPipelineEdges);
        setScenarioName('Data Pipeline Orchestrator');
        
        toast({
          title: "Agent Loaded",
          description: "Data Pipeline Orchestrator flow loaded successfully",
        });
      } else if (agentId === '8') {
        // Security Scanner Pro flow
        const securityScannerNodes: Node[] = [
          {
            id: 'entry_1',
            type: 'entry',
            position: { x: 250, y: 50 },
            data: { label: 'Security Scan Schedule' },
          },
          {
            id: 'tool_1',
            type: 'tool',
            position: { x: 250, y: 150 },
            data: { 
              label: 'Port Scan',
              toolType: 'nmap',
              action: 'scan',
              targets: '{{network_range}}',
              flags: '-sV -sC',
            },
          },
          {
            id: 'tool_2',
            type: 'tool',
            position: { x: 100, y: 300 },
            data: { 
              label: 'Vulnerability Scan',
              toolType: 'openvas',
              action: 'scan',
              profile: 'full_and_deep',
            },
          },
          {
            id: 'tool_3',
            type: 'tool',
            position: { x: 400, y: 300 },
            data: { 
              label: 'Code Analysis',
              toolType: 'sonarqube',
              action: 'analyze',
              project: '{{project_key}}',
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            position: { x: 250, y: 450 },
            data: { 
              label: 'Analyze Security Findings',
              model: 'gpt-4',
              prompt: `Analyze the security scan results and prioritize findings:

Port Scan Results: {{port_scan}}
Vulnerability Scan: {{vuln_scan}}
Code Analysis: {{code_analysis}}

For each finding:
1. Assess severity (Critical/High/Medium/Low)
2. Determine exploitability
3. Recommend remediation steps
4. Estimate effort required
5. Prioritize based on risk`,
              temperature: 0.1,
              maxTokens: 3000,
            },
          },
          {
            id: 'condition_1',
            type: 'condition',
            position: { x: 250, y: 600 },
            data: { 
              label: 'Critical Issues?',
              condition: 'has_critical',
              operator: 'equals',
              value: true,
            },
          },
          {
            id: 'tool_4',
            type: 'tool',
            position: { x: 100, y: 750 },
            data: { 
              label: 'Emergency Alert',
              toolType: 'pagerduty',
              action: 'trigger',
              severity: 'critical',
              message: '🚨 Critical security vulnerabilities detected!',
            },
          },
          {
            id: 'tool_5',
            type: 'tool',
            position: { x: 400, y: 750 },
            data: { 
              label: 'Create Report',
              toolType: 'jira',
              action: 'create_issues',
              project: 'SECURITY',
              issues: '{{security_findings}}',
            },
          },
          {
            id: 'triggerAgent_1',
            type: 'triggerAgent',
            position: { x: 250, y: 900 },
            data: {
              label: 'Trigger Dependency Updater',
              agentId: '4',
              inputData: '{{vulnerable_dependencies}}',
              contextData: 'Security scan found vulnerable dependencies',
              mode: 'autonomous'
            },
          },
          {
            id: 'exit_1',
            type: 'exit',
            position: { x: 250, y: 1050 },
            data: { label: 'Scan Complete' },
          },
        ];

        const securityScannerEdges: Edge[] = [
          {
            id: 'e1-2',
            source: 'entry_1',
            target: 'tool_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-3',
            source: 'tool_1',
            target: 'tool_2',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e2-4',
            source: 'tool_1',
            target: 'tool_3',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e3-5',
            source: 'tool_2',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e4-5',
            source: 'tool_3',
            target: 'llm_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e5-6',
            source: 'llm_1',
            target: 'condition_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e6-7',
            source: 'condition_1',
            sourceHandle: 'true',
            target: 'tool_4',
            animated: true,
            style: { stroke: '#ef4444' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444',
            },
            label: 'Yes',
            labelStyle: { fill: '#ef4444', fontWeight: 700 },
          },
          {
            id: 'e6-8',
            source: 'condition_1',
            sourceHandle: 'false',
            target: 'tool_5',
            animated: true,
            style: { stroke: '#10b981' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
            },
            label: 'No',
            labelStyle: { fill: '#10b981', fontWeight: 700 },
          },
          {
            id: 'e7-9',
            source: 'tool_4',
            target: 'tool_5',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e8-9',
            source: 'tool_5',
            target: 'triggerAgent_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
          {
            id: 'e9-10',
            source: 'triggerAgent_1',
            target: 'exit_1',
            animated: true,
            style: { stroke: '#60a5fa' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#60a5fa',
            },
          },
        ];

        setNodes(securityScannerNodes);
        setEdges(securityScannerEdges);
        setScenarioName('Security Scanner Pro');
        
        toast({
          title: "Agent Loaded",
          description: "Security Scanner Pro flow loaded successfully",
        });
      } else {
        // Default loading message for other agents
        toast({
          title: "Loading Agent",
          description: `Loading agent ${agentId}...`,
        });
      }
    }
  }, [searchParams, toast, setNodes, setEdges]);

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

  const handleApplyScaffold = useCallback((scaffold: any) => {
    // Clear existing nodes except entry if user confirms
    const hasExistingNodes = nodes.length > 1 || edges.length > 0;
    
    if (hasExistingNodes) {
      const confirmed = window.confirm(
        'This will replace your current flow. Do you want to continue?'
      );
      if (!confirmed) return;
    }

    // Apply scaffold nodes with proper ID mapping
    const idMapping: Record<string, string> = {};
    const scaffoldNodes = scaffold.nodes.map((node: any) => {
      const newId = `scaffold_${node.id}_${Date.now()}`;
      idMapping[node.id] = newId;
      return {
        ...node,
        id: newId,
      };
    });

    // Apply scaffold connections with updated IDs
    const scaffoldEdges = scaffold.connections.map((conn: any, index: number) => ({
      id: `scaffold_edge_${index}_${Date.now()}`,
      source: idMapping[conn.source] || conn.source,
      target: idMapping[conn.target] || conn.target,
      animated: true,
      style: { stroke: '#60a5fa' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#60a5fa',
      },
    }));

    // Update the flow
    setNodes(scaffoldNodes);
    setEdges(scaffoldEdges);
    
    // Update scenario name
    setScenarioName(scaffold.name);
    
    // Save to history (automatic)
    setTimeout(() => saveToHistory(), 100);
    
    // Auto-save the workflow (simulate save action)
    setTimeout(() => {
      onSave();
    }, 200);
    
    // Close AI chat
    setShowAIScaffold(false);
    
    toast({
      title: "Agent Scaffolded & Saved!",
      description: `${scaffold.name} has been created and automatically saved to your project`,
      duration: 4000,
    });
  }, [nodes, edges, setNodes, setEdges, saveToHistory, toast]);

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
        case 'sheets':
          nodeData = {
            label: 'Google Sheets',
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
        type: type === 'openai' || type === 'anthropic' || type === 'google' ? 'llm' : 
              type === 'sheets' || type === 'slack' || type === 'gmail' || type === 'discord' || type === 'twitter' || type === 'webhook' ? 'tool' : type,
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
      setSaveStatus('saving');
      
      const flow = reactFlowInstance.toObject();
      
      // Enhanced save data with metadata
      const saveData = {
        ...flow,
        metadata: {
          name: scenarioName,
          savedAt: new Date().toISOString(),
          version: '1.0.0',
          nodeCount: nodes.length,
          edgeCount: edges.length,
        }
      };
      
      console.log('Saving flow:', saveData);
      
      // Simulate async save (in production, this would be backend)
      setTimeout(() => {
        localStorage.setItem('agent-flow', JSON.stringify(saveData));
        localStorage.setItem('agent-flow-backup', JSON.stringify(saveData));
        
        const now = new Date();
        setLastSaved(now);
        setSaveStatus('saved');
        
        toast({
          title: "✅ Agent Saved Successfully",
          description: `"${scenarioName}" has been saved with ${nodes.length} nodes and ${edges.length} connections`,
          duration: 3000,
        });
      }, 500); // Small delay to show saving state
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
      setSaveStatus('unsaved'); // Mark as unsaved when changes are made
      
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

  // Handle edge changes with history
  const onEdgesChangeWithHistory = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setSaveStatus('unsaved'); // Mark as unsaved when connections change
    },
    [onEdgesChange]
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

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || saveStatus !== 'unsaved') return;

    const autoSaveTimer = setTimeout(() => {
      if (saveStatus === 'unsaved') {
        onSave();
      }
    }, 10000); // Auto-save after 10 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [saveStatus, autoSave, onSave]);

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
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'saved' && lastSaved ? (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Saved {Math.round((Date.now() - lastSaved.getTime()) / 60000)} min ago
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Not saved
                  </>
                )}
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
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setShowAIScaffold(true)}
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Scaffold
            </Button>
            
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
              onEdgesChange={onEdgesChangeWithHistory}
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
        
        {/* AI Scaffold Chat Modal */}
        {showAIScaffold && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl h-[600px] max-h-[80vh]">
              <AIScaffoldChat
                onScaffold={handleApplyScaffold}
                onClose={() => setShowAIScaffold(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
