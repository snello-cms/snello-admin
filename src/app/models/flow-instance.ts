import {FlowTaskState} from './flow-task-state';

/** A workflow instance as tracked by flow-bridge from the runner's events (GET /api/flow/instances[/id]). */
export interface FlowInstance {
    instanceId: string;
    namespace: string;
    name: string;
    version: string;
    /** RUNNING / WAITING / SUSPENDED / PENDING / COMPLETED / FAULTED / CANCELLED */
    status: string;
    startedAt: string;
    endedAt?: string;
    lastUpdate: string;
    currentTask?: string;
    currentPosition?: string;
    error?: {type?: string; status?: number; title?: string; position?: string; at?: string};
    taskCount?: number;
    /** only on GET /api/flow/instances/{id} */
    tasks?: Record<string, FlowTaskState>;
}
