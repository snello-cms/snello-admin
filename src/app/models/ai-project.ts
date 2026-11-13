/** Row of /api/ai/projects: groups everything one AI use case needs (skills, MCP tools, cards, service accounts). */
export class AiProject {
  uuid: string;
  name: string;
  description: string;
  /** System prompt prepended to every chat of this project. */
  global_message: string;
  /** Keycloak group required to use the project; empty = everyone. */
  sso_group: string;
  roles: string;
}
