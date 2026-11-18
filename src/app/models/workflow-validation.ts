/** Answer of POST /api/workflowdefinitions/validate: the YAML's document block and the parsed workflow (for the diagram). */
export interface WorkflowValidation {
  document: {dsl: string; namespace: string; name: string; version: string; title: string; summary: string};
  workflow: any;
}
