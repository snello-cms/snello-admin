/** A snello human task as /api/humantasks answers it (subset the admin shows). */
export interface HumanTask {
  uuid: string;
  title: string;
  status: string;          // OPEN / CLOSED / CANCELLED
  decision?: string;
  decided_by?: string;
  decided_at?: string;
  roles?: string;          // "Admin,Manager": who may decide
  decisions?: string;      // "APPROVE,REFUSE"
  page_name?: string;
  instance_id?: string;
  /** the task's page: {public url}/p/{page_name | task}?task={uuid} */
  url: string;
}
