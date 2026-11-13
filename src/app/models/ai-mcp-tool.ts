/** Row of /api/ai/mcp-tools: a REST call the agent can make, described to the model by parameters_json. */
export class AiMcpTool {
  uuid: string;
  project_uuid: string;
  name: string;
  description: string;
  http_method = 'GET';
  /** Absolute, or relative to snello.ai.mcp.http.base-url; {arg} placeholders are filled from the arguments. */
  url: string;
  /** JSON schema of the arguments shown to the model. */
  parameters_json = '{"type":"object","properties":{}}';
  /** QUERY: arguments as query string; BODY: JSON body (not for GET/HEAD). */
  arg_binding = 'QUERY';
  /** JSON map argument name -> HTTP name. */
  arg_names_json: string;
  /** JSON map of query params always sent. */
  fixed_query_json: string;
  catalog_page_path_template: string;
  /** Links the result to a card with the same result_type. */
  result_type: string;
  result_path: string;
  /** Sends a bearer token obtained with the service account. */
  authenticated = false;
  service_account_uuid: string;
  allowed_roles: string;
  enabled = true;
}
