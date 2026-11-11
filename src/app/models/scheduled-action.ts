/** Row of /api/scheduledactions: a JS body run on a cron by the API's scheduled-actions timer. */
export class ScheduledAction {
  uuid: string;
  name: string;
  description: string;
  /** Cron: 5 fields (0 17 * * *) or Quartz with seconds (0 0 17 * * ?). */
  frequency: string;
  enabled = true;
  body: string;
  // written by the scheduler, read-only here
  next_run: string;
  last_run: string;
  last_status: string;
  last_message: string;
  last_duration_ms: number;
}
