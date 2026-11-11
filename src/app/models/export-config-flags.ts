/** Config tables the metadata export can carry next to the metadatas (body flags of POST /api/metadatas/export). */
export interface ExportConfigFlags {
  /** follow the selected metadatas; all rows when none is selected */
  actions?: boolean;
  /** follow the selected metadatas; all rows when none is selected */
  conditions?: boolean;
  select_queries?: boolean;
  scheduled_actions?: boolean;
  print_templates?: boolean;
}

export const EXPORT_CONFIG_OPTIONS: { key: keyof ExportConfigFlags; label: string; hint: string }[] = [
  {key: 'actions', label: 'Actions', hint: 'of the selected metadatas, all if none selected'},
  {key: 'conditions', label: 'Conditions', hint: 'of the selected metadatas, all if none selected'},
  {key: 'select_queries', label: 'Select queries', hint: 'all'},
  {key: 'scheduled_actions', label: 'Scheduled actions', hint: 'all, imported disabled'},
  {key: 'print_templates', label: 'Print templates', hint: 'all'}
];
