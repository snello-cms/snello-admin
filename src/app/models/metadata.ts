import {Condition} from './condtion';
import {FieldDefinition} from './field-definition';

export class Metadata {
  uuid: string;
  table_name: string;
  select_fields: string;
  search_fields: string;
  description: string;
  metadata_group: string;
  alias_table: string;
  alias_condition: string;
  table_key: string;
  creation_query: string;
  order_by: string;

  table_key_type: string;
  table_key_addition: string;

  api_protected: boolean;
  username_field: string;

  icon: string;
  tab_groups: string;
  created: boolean;
  already_exist: boolean;
  fields: FieldDefinition[];
  conditions: Condition[];

  calendar_enabled: boolean;
  calendar_field: string;
  calendar_label: string;
}
