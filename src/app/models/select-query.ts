export class SelectQuery {
  uuid: string;
  query_name: string;
  select_query: string;
  select_query_count: string;
  with_params: boolean;
  /** Row-level security: non-admin callers only get rows whose username_field equals their username. */
  api_protected: boolean;
  /** Column of the query result holding the owner username (required when api_protected). */
  username_field: string;
}
