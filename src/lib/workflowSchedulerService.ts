import { Workflow, WorkflowExecutionResult } from './workflowTypes';
import { workflowExecutionService } from './workflowExecutionService';

export interface ScheduledWorkflow {
  id: string;
  workflowId: string;
  cronExpression: string;
  name: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  runCount: number;
  errorCount: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowSchedule {
  workflowId: string;
  cronExpression: string;
  enabled: boolean;
  timezone?: string;
  maxRuns?: number;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
  };
}

export class WorkflowSchedulerService {
  private scheduledWorkflows: Map<string, ScheduledWorkflow> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  /**
   * Initialize the scheduler
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Load scheduled workflows from storage
    await this.loadScheduledWorkflows();
    
    // Start scheduling
    this.startScheduler();
    
    this.isInitialized = true;
    console.log('Workflow scheduler initialized');
  }

  /**
   * Schedule a workflow to run on a cron schedule
   */
  public scheduleWorkflow(
    workflow: Workflow,
    schedule: WorkflowSchedule
  ): ScheduledWorkflow {
    const scheduledWorkflow: ScheduledWorkflow = {
      id: `schedule-${workflow.id}-${Date.now()}`,
      workflowId: workflow.id,
      cronExpression: schedule.cronExpression,
      name: `${workflow.name} (Scheduled)`,
      enabled: schedule.enabled,
      nextRun: this.calculateNextRun(schedule.cronExpression),
      runCount: 0,
      errorCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.scheduledWorkflows.set(scheduledWorkflow.id, scheduledWorkflow);
    
    if (scheduledWorkflow.enabled) {
      this.scheduleNext(scheduledWorkflow);
    }
    
    this.saveScheduledWorkflows();
    
    return scheduledWorkflow;
  }

  /**
   * Unschedule a workflow
   */
  public unscheduleWorkflow(scheduleId: string): boolean {
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(scheduleId);
    }
    
    const removed = this.scheduledWorkflows.delete(scheduleId);
    if (removed) {
      this.saveScheduledWorkflows();
    }
    
    return removed;
  }

  /**
   * Enable or disable a scheduled workflow
   */
  public toggleSchedule(scheduleId: string, enabled: boolean): boolean {
    const scheduled = this.scheduledWorkflows.get(scheduleId);
    if (!scheduled) return false;
    
    scheduled.enabled = enabled;
    scheduled.updatedAt = new Date().toISOString();
    
    if (enabled) {
      scheduled.nextRun = this.calculateNextRun(scheduled.cronExpression);
      this.scheduleNext(scheduled);
    } else {
      const timer = this.timers.get(scheduleId);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(scheduleId);
      }
    }
    
    this.saveScheduledWorkflows();
    return true;
  }

  /**
   * Get all scheduled workflows
   */
  public getScheduledWorkflows(): ScheduledWorkflow[] {
    return Array.from(this.scheduledWorkflows.values());
  }

  /**
   * Get a specific scheduled workflow
   */
  public getScheduledWorkflow(scheduleId: string): ScheduledWorkflow | undefined {
    return this.scheduledWorkflows.get(scheduleId);
  }

  /**
   * Update a scheduled workflow
   */
  public updateSchedule(
    scheduleId: string,
    updates: Partial<WorkflowSchedule>
  ): boolean {
    const scheduled = this.scheduledWorkflows.get(scheduleId);
    if (!scheduled) return false;
    
    // Update properties
    if (updates.cronExpression) {
      scheduled.cronExpression = updates.cronExpression;
      scheduled.nextRun = this.calculateNextRun(updates.cronExpression);
    }
    
    if (updates.enabled !== undefined) {
      scheduled.enabled = updates.enabled;
    }
    
    scheduled.updatedAt = new Date().toISOString();
    
    // Reschedule if needed
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(scheduleId);
    }
    
    if (scheduled.enabled) {
      this.scheduleNext(scheduled);
    }
    
    this.saveScheduledWorkflows();
    return true;
  }

  /**
   * Manually trigger a scheduled workflow
   */
  public async triggerScheduledWorkflow(scheduleId: string): Promise<WorkflowExecutionResult | null> {
    const scheduled = this.scheduledWorkflows.get(scheduleId);
    if (!scheduled) return null;
    
    return this.executeScheduledWorkflow(scheduled);
  }

  /**
   * Start the scheduler
   */
  private startScheduler(): void {
    // Schedule all enabled workflows
    this.scheduledWorkflows.forEach(scheduled => {
      if (scheduled.enabled) {
        this.scheduleNext(scheduled);
      }
    });
  }

  /**
   * Schedule the next execution of a workflow
   */
  private scheduleNext(scheduled: ScheduledWorkflow): void {
    const now = new Date();
    const nextRun = new Date(scheduled.nextRun);
    const delay = Math.max(0, nextRun.getTime() - now.getTime());
    
    const timer = setTimeout(async () => {
      await this.executeScheduledWorkflow(scheduled);
      
      // Schedule next run if still enabled
      if (scheduled.enabled) {
        scheduled.nextRun = this.calculateNextRun(scheduled.cronExpression);
        this.scheduleNext(scheduled);
        this.saveScheduledWorkflows();
      }
    }, delay);
    
    this.timers.set(scheduled.id, timer);
  }

  /**
   * Execute a scheduled workflow
   */
  private async executeScheduledWorkflow(
    scheduled: ScheduledWorkflow
  ): Promise<WorkflowExecutionResult> {
    console.log(`Executing scheduled workflow: ${scheduled.name}`);
    
    try {
      // Load the workflow
      const workflow = await this.loadWorkflow(scheduled.workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${scheduled.workflowId} not found`);
      }
      
      // Execute the workflow
      const result = await workflowExecutionService.executeWorkflow(workflow, {
        onLogUpdate: (log) => {
          console.log(`[${scheduled.name}] ${log}`);
        },
        onWorkflowComplete: (result) => {
          console.log(`[${scheduled.name}] Completed: ${result.success ? 'Success' : 'Failed'}`);
        }
      });
      
      // Update statistics
      scheduled.runCount++;
      scheduled.lastRun = new Date().toISOString();
      
      if (!result.success) {
        scheduled.errorCount++;
        scheduled.lastError = result.error || 'Unknown error';
      } else {
        // Clear previous error if this run was successful
        scheduled.lastError = undefined;
      }
      
      scheduled.updatedAt = new Date().toISOString();
      this.saveScheduledWorkflows();
      
      return result;
    } catch (error) {
      console.error(`Error executing scheduled workflow ${scheduled.name}:`, error);
      
      scheduled.errorCount++;
      scheduled.lastError = error instanceof Error ? error.message : 'Unknown error';
      scheduled.lastRun = new Date().toISOString();
      scheduled.updatedAt = new Date().toISOString();
      
      this.saveScheduledWorkflows();
      
      return {
        success: false,
        error: scheduled.lastError,
        nodeResults: {},
        executionTime: '0s'
      };
    }
  }

  /**
   * Calculate next run time based on cron expression
   * Simplified implementation - in production, use a proper cron library
   */
  private calculateNextRun(cronExpression: string): string {
    // This is a simplified implementation
    // In a real application, use a library like 'node-cron' or 'cron-parser'
    
    const now = new Date();
    
    // Simple patterns for demo
    switch (cronExpression) {
      case '*/5 * * * *': // Every 5 minutes
        return new Date(now.getTime() + 5 * 60 * 1000).toISOString();
      case '0 * * * *': // Every hour
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      case '0 0 * * *': // Daily at midnight
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toISOString();
      case '0 0 * * 0': // Weekly on Sunday
        const nextSunday = new Date(now);
        nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
        nextSunday.setHours(0, 0, 0, 0);
        return nextSunday.toISOString();
      default:
        // Default to 1 hour from now
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Load workflow by ID
   */
  private async loadWorkflow(workflowId: string): Promise<Workflow | null> {
    // In a real implementation, this would load from a database or workflow service
    // For now, we'll load from localStorage
    try {
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      return workflows.find((w: Workflow) => w.id === workflowId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Load scheduled workflows from storage
   */
  private async loadScheduledWorkflows(): Promise<void> {
    try {
      const saved = localStorage.getItem('scheduledWorkflows');
      if (saved) {
        const schedules: ScheduledWorkflow[] = JSON.parse(saved);
        schedules.forEach(schedule => {
          this.scheduledWorkflows.set(schedule.id, schedule);
        });
      }
    } catch (error) {
      console.error('Error loading scheduled workflows:', error);
    }
  }

  /**
   * Save scheduled workflows to storage
   */
  private saveScheduledWorkflows(): void {
    try {
      const schedules = Array.from(this.scheduledWorkflows.values());
      localStorage.setItem('scheduledWorkflows', JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving scheduled workflows:', error);
    }
  }

  /**
   * Stop the scheduler and clean up
   */
  public shutdown(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    this.isInitialized = false;
    console.log('Workflow scheduler shut down');
  }
}

export const workflowSchedulerService = new WorkflowSchedulerService();