// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Multi-Agent Orchestrator - Main Entry Point
 */

// Core exports
export { MultiAgentOrchestrator } from './core/orchestrator';
export { WorkflowEngine } from './core/workflow-engine';
export { AgentPool } from './core/agent-pool';
export { ModelIntegration } from './core/model-integration';
export { CollaborationManager } from './core/collaboration-manager';
export { ExecutionMonitor } from './core/execution-monitor';

// Type exports
export * from './core/types';

// Version
export const VERSION = '1.0.0';
