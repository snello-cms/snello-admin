/** Row of /api/ai/skills: instructions the agent loads for a project; it calls the project's MCP tools. */
export class AiSkill {
  uuid: string;
  project_uuid: string;
  name: string;
  description: string;
  instructions: string;
  /** Comma-separated roles; empty = every user of the project. */
  allowed_roles: string;
  enabled = true;
}
