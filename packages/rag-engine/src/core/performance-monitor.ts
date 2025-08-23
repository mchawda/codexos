// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
/**
 * Performance monitoring service for RAG Engine
 */

import { EventEmitter } from 'events';
import { RAGConfig } from './types';

export interface PerformanceMetrics {
  timestamp: number;
  queryCount: number;
  averageQueryTime: number;
  slowQueryCount: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  cacheHitRate: number;
  ingestionThroughput: number;
  errorRate: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableProfiling: boolean;
  slowQueryThreshold: number;
  maxMemoryUsage: number;
  maxCpuUsage: number;
  maxErrorRate: number;
  metricsInterval: number;
  alerting: boolean;
}

export class PerformanceMonitor extends EventEmitter {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring: boolean = false;
  private metricsInterval: NodeJS.Timeout | null = null;
  private startTime: number = Date.now();
  private queryTimes: number[] = [];
  private errorCount: number = 0;
  private totalQueries: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private ingestionCount: number = 0;
  private lastIngestionTime: number = Date.now();

  constructor(config: PerformanceConfig) {
    super();
    this.config = config;
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = Date.now();
    
    // Start metrics collection
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }

    this.emit('monitoring_started', { timestamp: Date.now() });
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    this.emit('monitoring_stopped', { timestamp: Date.now() });
  }

  /**
   * Record a query execution
   */
  recordQuery(duration: number, wasSlow: boolean = false): void {
    if (!this.isMonitoring) return;

    this.totalQueries++;
    this.queryTimes.push(duration);

    if (wasSlow) {
      this.emit('slow_query', { duration, threshold: this.config.slowQueryThreshold });
    }

    // Keep only recent query times for rolling average
    if (this.queryTimes.length > 1000) {
      this.queryTimes = this.queryTimes.slice(-1000);
    }
  }

  /**
   * Record cache hit/miss
   */
  recordCacheAccess(hit: boolean): void {
    if (hit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
  }

  /**
   * Record ingestion operation
   */
  recordIngestion(documentCount: number): void {
    this.ingestionCount += documentCount;
    this.lastIngestionTime = Date.now();
  }

  /**
   * Record error occurrence
   */
  recordError(): void {
    this.errorCount++;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    // Calculate query statistics
    const averageQueryTime = this.queryTimes.length > 0 
      ? this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length 
      : 0;
    
    const slowQueryCount = this.queryTimes.filter(time => time > this.config.slowQueryThreshold).length;
    
    // Calculate cache hit rate
    const totalCacheAccess = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalCacheAccess > 0 ? (this.cacheHits / totalCacheAccess) * 100 : 0;
    
    // Calculate ingestion throughput (documents per minute)
    const ingestionThroughput = uptime > 0 ? (this.ingestionCount / (uptime / 60000)) : 0;
    
    // Calculate error rate
    const errorRate = this.totalQueries > 0 ? (this.errorCount / this.totalQueries) * 100 : 0;

    // Get system metrics
    const memoryUsage = this.getMemoryUsage();
    const cpuUsage = this.getCpuUsage();

    const metrics: PerformanceMetrics = {
      timestamp: now,
      queryCount: this.totalQueries,
      averageQueryTime,
      slowQueryCount,
      memoryUsage,
      cpuUsage,
      activeConnections: this.getActiveConnections(),
      cacheHitRate,
      ingestionThroughput,
      errorRate,
    };

    return metrics;
  }

  /**
   * Get performance history
   */
  getMetricsHistory(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get performance alerts
   */
  getAlerts(limit: number = 50): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    uptime: number;
    totalQueries: number;
    averageQueryTime: number;
    slowQueryPercentage: number;
    cacheHitRate: number;
    errorRate: number;
    ingestionThroughput: number;
  } {
    const metrics = this.getCurrentMetrics();
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime,
      totalQueries: metrics.queryCount,
      averageQueryTime: metrics.averageQueryTime,
      slowQueryPercentage: metrics.queryCount > 0 ? (metrics.slowQueryCount / metrics.queryCount) * 100 : 0,
      cacheHitRate: metrics.cacheHitRate,
      errorRate: metrics.errorRate,
      ingestionThroughput: metrics.ingestionThroughput,
    };
  }

  /**
   * Check for performance issues and generate alerts
   */
  private checkPerformance(): void {
    if (!this.config.alerting) return;

    const metrics = this.getCurrentMetrics();
    const alerts: PerformanceAlert[] = [];

    // Check query performance
    if (metrics.averageQueryTime > this.config.slowQueryThreshold) {
      alerts.push({
        type: 'warning',
        metric: 'averageQueryTime',
        value: metrics.averageQueryTime,
        threshold: this.config.slowQueryThreshold,
        message: `Average query time (${metrics.averageQueryTime.toFixed(2)}ms) exceeds threshold (${this.config.slowQueryThreshold}ms)`,
        timestamp: Date.now(),
      });
    }

    // Check memory usage
    if (metrics.memoryUsage > this.config.maxMemoryUsage) {
      alerts.push({
        type: 'critical',
        metric: 'memoryUsage',
        value: metrics.memoryUsage,
        threshold: this.config.maxMemoryUsage,
        message: `Memory usage (${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB) exceeds limit (${(this.config.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB)`,
        timestamp: Date.now(),
      });
    }

    // Check CPU usage
    if (metrics.cpuUsage > this.config.maxCpuUsage) {
      alerts.push({
        type: 'warning',
        metric: 'cpuUsage',
        value: metrics.cpuUsage,
        threshold: this.config.maxCpuUsage,
        message: `CPU usage (${metrics.cpuUsage.toFixed(2)}%) exceeds threshold (${this.config.maxCpuUsage}%)`,
        timestamp: Date.now(),
      });
    }

    // Check error rate
    if (metrics.errorRate > this.config.maxErrorRate) {
      alerts.push({
        type: 'critical',
        metric: 'errorRate',
        value: metrics.errorRate,
        threshold: this.config.maxErrorRate,
        message: `Error rate (${metrics.errorRate.toFixed(2)}%) exceeds threshold (${this.config.maxErrorRate}%)`,
        timestamp: Date.now(),
      });
    }

    // Add new alerts
    this.alerts.push(...alerts);

    // Keep only recent alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    // Emit alerts
    alerts.forEach(alert => {
      this.emit('performance_alert', alert);
    });
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      if (!this.isMonitoring) return;

      const metrics = this.getCurrentMetrics();
      this.metrics.push(metrics);

      // Keep only recent metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Check for performance issues
      this.checkPerformance();

      // Emit metrics
      this.emit('metrics_collected', metrics);
    }, this.config.metricsInterval);
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Get current CPU usage (simplified)
   */
  private getCpuUsage(): number {
    // This is a simplified CPU usage calculation
    // In production, you might want to use a more sophisticated approach
    return 0;
  }

  /**
   * Get active connections count
   */
  private getActiveConnections(): number {
    // This should be implemented based on your connection management
    return 0;
  }

  /**
   * Reset performance counters
   */
  reset(): void {
    this.queryTimes = [];
    this.errorCount = 0;
    this.totalQueries = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.ingestionCount = 0;
    this.startTime = Date.now();
    this.metrics = [];
    this.alerts = [];
  }

  /**
   * Export performance data
   */
  exportData(): {
    metrics: PerformanceMetrics[];
    alerts: PerformanceAlert[];
    summary: any;
  } {
    return {
      metrics: this.metrics,
      alerts: this.alerts,
      summary: this.getPerformanceSummary(),
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const metrics = this.getCurrentMetrics();
    const recommendations: string[] = [];

    if (metrics.averageQueryTime > this.config.slowQueryThreshold) {
      recommendations.push('Consider increasing chunk size or enabling approximate search for better query performance');
    }

    if (metrics.cacheHitRate < 50) {
      recommendations.push('Cache hit rate is low. Consider increasing cache size or optimizing cache invalidation');
    }

    if (metrics.errorRate > 5) {
      recommendations.push('Error rate is high. Check system logs and verify external service connections');
    }

    if (metrics.memoryUsage > this.config.maxMemoryUsage * 0.8) {
      recommendations.push('Memory usage is approaching limit. Consider reducing batch sizes or enabling compression');
    }

    if (metrics.ingestionThroughput < 10) {
      recommendations.push('Ingestion throughput is low. Consider increasing batch sizes or optimizing chunking');
    }

    return recommendations;
  }
}
