import {Condition} from './condtion';
import {FieldDefinition} from "./field-definition";
export class Metadata {
  uuid: string;
  table_name: string;
  select_fields: string;
  description: string;
  alias_table: string;
  alias_condition: string;
  table_key: string;
  creation_query: string;
  order_by: string;

  table_key_type: string;
  table_key_addition: string;

  fields: FieldDefinition[];
  conditions: Condition[];
}
