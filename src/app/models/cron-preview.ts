/** Response of GET /api/scheduledactions/preview. */
export interface CronPreview {
  valid: boolean;
  zone?: string;
  next_runs?: string[];
  error?: string;
}
