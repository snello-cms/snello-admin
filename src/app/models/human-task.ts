/** A snello human task as /api/humantasks answers it (subset the admin shows). */
export interface HumanTask {
  uuid: string;
  title: string;
  status: string;          // OPEN / CLOSED / CANCELLED
  decision?: string;
  decided_by?: string;
  decisions?: string;      // "APPROVE,REFUSE"
  page_name?: string;
  instance_id?: string;
  /** the task's page: {public url}/p/{page_name | task}?task={uuid} */
  url: string;
}
