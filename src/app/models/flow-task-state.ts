/** One task position of an instance as seen by flow-bridge (key of FlowInstance.tasks: e.g. do/1/mailReviewer/try). */
export interface FlowTaskState {
    name: string;
    /** last event: started / completed / faulted / retried ... */
    state: string;
    /** how many times it started (loops: polling tasks count up) */
    count: number;
    /** faulted events (caught + retried tasks fault and then complete) */
    faults?: number;
    lastError?: string;
    at: string;
}
