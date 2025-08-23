// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Real-time Collaboration Manager for multi-user agent development
 */

import { EventEmitter } from 'eventemitter3';
import { Subject, Observable, merge } from 'rxjs';
import { filter, map, debounceTime } from 'rxjs/operators';
import {
  CollaborationSession,
  Participant,
  SharedContext,
  Lock,
  CollaborationConfig,
  Permission
} from './types';

export interface CollaborationUpdate {
  sessionId: string;
  participantId: string;
  type: 'data' | 'cursor' | 'selection' | 'comment';
  path: string[];
  operation: Operation;
  timestamp: Date;
}

export interface Operation {
  type: 'insert' | 'delete' | 'replace' | 'move';
  position?: number;
  content?: any;
  from?: number;
  to?: number;
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'operational-transform' | 'crdt';
  resolve: (updates: CollaborationUpdate[]) => CollaborationUpdate[];
}

export interface CursorPosition {
  participantId: string;
  path: string[];
  position: number;
  timestamp: Date;
}

export interface SelectionRange {
  participantId: string;
  path: string[];
  start: number;
  end: number;
  timestamp: Date;
}

export class CollaborationManager extends EventEmitter {
  private config: CollaborationConfig;
  private sessions: Map<string, CollaborationSession>;
  private updateStream: Subject<CollaborationUpdate>;
  private conflictResolver: ConflictResolution;
  private cursorPositions: Map<string, CursorPosition>;
  private selections: Map<string, SelectionRange>;
  private operationBuffer: Map<string, CollaborationUpdate[]>;

  constructor(config: CollaborationConfig) {
    super();
    this.config = config;
    this.sessions = new Map();
    this.updateStream = new Subject();
    this.cursorPositions = new Map();
    this.selections = new Map();
    this.operationBuffer = new Map();
    
    this.conflictResolver = this.createConflictResolver(config.conflictResolution);
    this.setupUpdatePipeline();
  }

  /**
   * Create a new collaboration session
   */
  async createSession(
    workflowId: string,
    creatorId: string
  ): Promise<CollaborationSession> {
    const sessionId = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const creator: Participant = {
      id: creatorId,
      type: 'human',
      role: 'owner',
      permissions: this.getDefaultPermissions('owner'),
      joinedAt: new Date(),
    };
    
    const session: CollaborationSession = {
      id: sessionId,
      workflowId,
      participants: [creator],
      status: 'active',
      startTime: new Date(),
      sharedContext: {
        data: {},
        locks: {},
        version: 0,
        lastUpdated: new Date(),
      },
    };
    
    this.sessions.set(sessionId, session);
    this.operationBuffer.set(sessionId, []);
    
    this.emit('session:created', session);
    
    return session;
  }

  /**
   * Join an existing collaboration session
   */
  async joinSession(
    sessionId: string,
    participantId: string,
    participantType: 'human' | 'agent' = 'human'
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    if (session.participants.length >= this.config.maxParticipants) {
      throw new Error('Session is full');
    }
    
    const participant: Participant = {
      id: participantId,
      type: participantType,
      role: 'contributor',
      permissions: this.getDefaultPermissions('contributor'),
      joinedAt: new Date(),
    };
    
    session.participants.push(participant);
    
    this.emit('participant:joined', { sessionId, participant });
    
    // Send current state to new participant
    this.sendStateSnapshot(sessionId, participantId);
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(sessionId: string, participantId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const participantIndex = session.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error('Participant not in session');
    }
    
    session.participants[participantIndex].leftAt = new Date();
    
    // Remove participant's cursors and selections
    this.cursorPositions.delete(`${sessionId}-${participantId}`);
    this.selections.delete(`${sessionId}-${participantId}`);
    
    // Release participant's locks
    this.releaseLocks(session, participantId);
    
    this.emit('participant:left', { sessionId, participantId });
    
    // If no active participants, pause session
    const activeParticipants = session.participants.filter(p => !p.leftAt);
    if (activeParticipants.length === 0) {
      session.status = 'paused';
      this.emit('session:paused', { sessionId });
    }
  }

  /**
   * Send a collaboration update
   */
  async sendUpdate(update: CollaborationUpdate): Promise<void> {
    const session = this.sessions.get(update.sessionId);
    if (!session) {
      throw new Error(`Session ${update.sessionId} not found`);
    }
    
    // Check permissions
    if (!this.hasPermission(session, update.participantId, 'write')) {
      throw new Error('No write permission');
    }
    
    // Add to operation buffer
    const buffer = this.operationBuffer.get(update.sessionId) || [];
    buffer.push(update);
    
    // Apply update through conflict resolution
    this.updateStream.next(update);
  }

  /**
   * Acquire a lock on a resource
   */
  async acquireLock(
    sessionId: string,
    participantId: string,
    resource: string,
    lockType: 'read' | 'write' | 'exclusive' = 'write'
  ): Promise<Lock> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const existingLock = session.sharedContext.locks[resource];
    if (existingLock) {
      // Check if lock is compatible
      if (existingLock.type === 'exclusive' || 
          (existingLock.type === 'write' && lockType !== 'read')) {
        throw new Error('Resource is locked');
      }
    }
    
    const lock: Lock = {
      holderId: participantId,
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + 30000), // 30 second lock
      type: lockType,
    };
    
    session.sharedContext.locks[resource] = lock;
    
    this.emit('lock:acquired', { sessionId, participantId, resource, lock });
    
    return lock;
  }

  /**
   * Release a lock
   */
  async releaseLock(
    sessionId: string,
    participantId: string,
    resource: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const lock = session.sharedContext.locks[resource];
    if (!lock || lock.holderId !== participantId) {
      throw new Error('Lock not held by participant');
    }
    
    delete session.sharedContext.locks[resource];
    
    this.emit('lock:released', { sessionId, participantId, resource });
  }

  /**
   * Update cursor position
   */
  updateCursorPosition(
    sessionId: string,
    participantId: string,
    path: string[],
    position: number
  ): void {
    const key = `${sessionId}-${participantId}`;
    const cursor: CursorPosition = {
      participantId,
      path,
      position,
      timestamp: new Date(),
    };
    
    this.cursorPositions.set(key, cursor);
    
    // Broadcast to other participants
    this.broadcastToOthers(sessionId, participantId, 'cursor:moved', cursor);
  }

  /**
   * Update selection range
   */
  updateSelection(
    sessionId: string,
    participantId: string,
    path: string[],
    start: number,
    end: number
  ): void {
    const key = `${sessionId}-${participantId}`;
    const selection: SelectionRange = {
      participantId,
      path,
      start,
      end,
      timestamp: new Date(),
    };
    
    this.selections.set(key, selection);
    
    // Broadcast to other participants
    this.broadcastToOthers(sessionId, participantId, 'selection:changed', selection);
  }

  /**
   * Get session state
   */
  getSessionState(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get active cursors for a session
   */
  getActiveCursors(sessionId: string): CursorPosition[] {
    const cursors: CursorPosition[] = [];
    
    this.cursorPositions.forEach((cursor, key) => {
      if (key.startsWith(sessionId)) {
        cursors.push(cursor);
      }
    });
    
    return cursors;
  }

  /**
   * Get active selections for a session
   */
  getActiveSelections(sessionId: string): SelectionRange[] {
    const selections: SelectionRange[] = [];
    
    this.selections.forEach((selection, key) => {
      if (key.startsWith(sessionId)) {
        selections.push(selection);
      }
    });
    
    return selections;
  }

  /**
   * Setup update processing pipeline
   */
  private setupUpdatePipeline(): void {
    // Process updates with debouncing for efficiency
    this.updateStream
      .pipe(
        // Group updates by session
        filter(update => this.sessions.has(update.sessionId)),
        debounceTime(50), // Batch updates every 50ms
        map(update => {
          const buffer = this.operationBuffer.get(update.sessionId) || [];
          this.operationBuffer.set(update.sessionId, []);
          return { sessionId: update.sessionId, updates: buffer };
        }),
        filter(batch => batch.updates.length > 0)
      )
      .subscribe(batch => {
        this.processBatch(batch.sessionId, batch.updates);
      });
  }

  /**
   * Process a batch of updates
   */
  private processBatch(sessionId: string, updates: CollaborationUpdate[]): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // Apply conflict resolution
    const resolvedUpdates = this.conflictResolver.resolve(updates);
    
    // Apply updates to shared context
    resolvedUpdates.forEach(update => {
      this.applyUpdate(session, update);
    });
    
    // Increment version
    session.sharedContext.version++;
    session.sharedContext.lastUpdated = new Date();
    
    // Broadcast updates to all participants
    this.broadcastUpdates(sessionId, resolvedUpdates);
  }

  /**
   * Apply update to shared context
   */
  private applyUpdate(session: CollaborationSession, update: CollaborationUpdate): void {
    const { path, operation } = update;
    let current = session.sharedContext.data;
    
    // Navigate to target location
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    const finalKey = path[path.length - 1];
    
    // Apply operation
    switch (operation.type) {
      case 'insert':
        if (Array.isArray(current[finalKey])) {
          current[finalKey].splice(operation.position!, 0, operation.content);
        } else {
          current[finalKey] = operation.content;
        }
        break;
        
      case 'delete':
        if (Array.isArray(current[finalKey])) {
          current[finalKey].splice(operation.position!, 1);
        } else {
          delete current[finalKey];
        }
        break;
        
      case 'replace':
        current[finalKey] = operation.content;
        break;
        
      case 'move':
        if (Array.isArray(current[finalKey])) {
          const item = current[finalKey].splice(operation.from!, 1)[0];
          current[finalKey].splice(operation.to!, 0, item);
        }
        break;
    }
  }

  /**
   * Create conflict resolver based on strategy
   */
  private createConflictResolver(strategy: string): ConflictResolution {
    switch (strategy) {
      case 'operational-transform':
        return {
          strategy: 'operational-transform',
          resolve: (updates) => this.operationalTransform(updates),
        };
        
      case 'crdt':
        return {
          strategy: 'crdt',
          resolve: (updates) => this.crdtResolve(updates),
        };
        
      case 'last-write-wins':
      default:
        return {
          strategy: 'last-write-wins',
          resolve: (updates) => updates.sort((a, b) => 
            a.timestamp.getTime() - b.timestamp.getTime()
          ),
        };
    }
  }

  /**
   * Operational transformation conflict resolution
   */
  private operationalTransform(updates: CollaborationUpdate[]): CollaborationUpdate[] {
    // Simplified OT implementation
    // In production, use a proper OT library
    const transformed: CollaborationUpdate[] = [];
    
    updates.forEach((update, index) => {
      let transformedUpdate = { ...update };
      
      // Transform against all previous updates
      for (let i = 0; i < index; i++) {
        transformedUpdate = this.transformAgainst(transformedUpdate, updates[i]);
      }
      
      transformed.push(transformedUpdate);
    });
    
    return transformed;
  }

  /**
   * Transform one update against another
   */
  private transformAgainst(
    update1: CollaborationUpdate,
    update2: CollaborationUpdate
  ): CollaborationUpdate {
    // Simplified transformation logic
    if (update1.path.join('.') !== update2.path.join('.')) {
      return update1; // Different paths, no conflict
    }
    
    // Same path, apply transformation based on operation types
    // This is a placeholder for actual OT logic
    return update1;
  }

  /**
   * CRDT-based conflict resolution
   */
  private crdtResolve(updates: CollaborationUpdate[]): CollaborationUpdate[] {
    // Simplified CRDT implementation
    // In production, use a proper CRDT library
    return updates.sort((a, b) => {
      // Sort by timestamp, then by participant ID for deterministic ordering
      const timeDiff = a.timestamp.getTime() - b.timestamp.getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.participantId.localeCompare(b.participantId);
    });
  }

  /**
   * Broadcast updates to all participants
   */
  private broadcastUpdates(sessionId: string, updates: CollaborationUpdate[]): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.participants.forEach(participant => {
      if (!participant.leftAt) {
        this.emit('updates:broadcast', {
          sessionId,
          participantId: participant.id,
          updates,
          version: session.sharedContext.version,
        });
      }
    });
  }

  /**
   * Broadcast to other participants
   */
  private broadcastToOthers(
    sessionId: string,
    senderId: string,
    event: string,
    data: any
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.participants.forEach(participant => {
      if (participant.id !== senderId && !participant.leftAt) {
        this.emit(event, {
          sessionId,
          participantId: participant.id,
          data,
        });
      }
    });
  }

  /**
   * Send state snapshot to participant
   */
  private sendStateSnapshot(sessionId: string, participantId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    this.emit('state:snapshot', {
      sessionId,
      participantId,
      state: session.sharedContext,
      cursors: this.getActiveCursors(sessionId),
      selections: this.getActiveSelections(sessionId),
    });
  }

  /**
   * Check if participant has permission
   */
  private hasPermission(
    session: CollaborationSession,
    participantId: string,
    action: string
  ): boolean {
    const participant = session.participants.find(p => p.id === participantId);
    if (!participant) return false;
    
    return participant.permissions.some(p => p.action === action);
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: string): Permission[] {
    switch (role) {
      case 'owner':
        return [
          { action: 'read', resource: '*' },
          { action: 'write', resource: '*' },
          { action: 'delete', resource: '*' },
          { action: 'admin', resource: '*' },
        ];
        
      case 'contributor':
        return [
          { action: 'read', resource: '*' },
          { action: 'write', resource: '*' },
        ];
        
      case 'viewer':
        return [
          { action: 'read', resource: '*' },
        ];
        
      default:
        return [];
    }
  }

  /**
   * Release all locks held by participant
   */
  private releaseLocks(session: CollaborationSession, participantId: string): void {
    Object.entries(session.sharedContext.locks).forEach(([resource, lock]) => {
      if (lock.holderId === participantId) {
        delete session.sharedContext.locks[resource];
        this.emit('lock:released', { 
          sessionId: session.id, 
          participantId, 
          resource 
        });
      }
    });
  }

  /**
   * Shutdown collaboration manager
   */
  async shutdown(): Promise<void> {
    // End all active sessions
    for (const [sessionId, session] of this.sessions) {
      session.status = 'completed';
      session.endTime = new Date();
      this.emit('session:ended', { sessionId });
    }
    
    this.sessions.clear();
    this.operationBuffer.clear();
    this.cursorPositions.clear();
    this.selections.clear();
    
    this.updateStream.complete();
    
    this.emit('shutdown');
  }
}
