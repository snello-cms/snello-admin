/** Row of /api/printtemplates: a query rendered to pdf / html / csv (Qute body) or xlsx (JXLS template). */
export class PrintTemplate {
  uuid: string;
  /** Letters, digits, _ and -: it is part of the print URL /api/printtemplates/{name}/print. */
  name: string;
  description: string;
  export_type: 'pdf' | 'html' | 'csv' | 'xlsx' = 'pdf';
  sql_query: string;
  /** Qute template for pdf / html / csv (empty csv body = automatic CSV of every column). */
  html_body: string;
  /** JXLS .xlsx template, base64. */
  template_file: string;
  template_file_name: string;
  api_protected = false;
  username_field: string;
}
