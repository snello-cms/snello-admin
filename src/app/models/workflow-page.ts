/** Row of /api/workflowpages: HTML + JS served at /p/{name}?task={uuid} with the snello page client. */
export class WorkflowPage {
  uuid: string;
  /** Lower case letters, digits and '-': it is the URL /p/{name}. */
  name: string;
  title: string;
  description: string;
  workflow_namespace: string;
  workflow_name: string;
  /** Comma separated roles allowed to decide (informative: each task carries its own roles). */
  roles: string;
  body: string;
}
