/** Row of /api/ai/service-accounts: Keycloak client credentials used by authenticated MCP tools. */
export class AiServiceAccount {
  uuid: string;
  project_uuid: string;
  name: string;
  /** Keycloak base URL, e.g. https://sso.example.com */
  host: string;
  realm: string;
  client_id: string;
  /** Write-only: the API never returns it; left empty on update = keep the stored one. */
  client_secret: string;
  enabled = true;
}
