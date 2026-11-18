/** Row of /api/workflowdefinitions: a Serverless Workflow 1.0 YAML; namespace/name/version/title/summary come from it. */
export class WorkflowDefinition {
  uuid: string;
  namespace: string;
  name: string;
  version: string;
  title: string;
  summary: string;
  yaml: string;
  /** DRAFT (editable) | DEPLOYED (loaded by the runner, immutable) | FAILED (runner refused it: see message) */
  status: string;
  /** last deploy result: the runner's error, or "loaded by the runner in N s" */
  message: string;
  created_at: string;
  created_by: string;
  deployed_at: string;
  deployed_by: string;
  /** seeded by snello (e.g. snello:record-approval): a normal, editable workflow, shown with a "default" badge */
  is_default: boolean;
}
