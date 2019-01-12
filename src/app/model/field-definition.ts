import {Validator} from "./validator";

export const MAP_INPUT_TO_FIELD : Map<string, any> = new Map(
  [
    ["string", ["input", "text"]],
    ["text", ["textarea", null]],
    ["number", ["input", "number"]],
    ["boolean", ["checkbox", null]],
    ["date", ["date", null]],
    ["email", ["input", "email"]],
    ["password", ["input", "password"]],
    ["enum", ["select", null]],
    ["media", ["media", null]]
  ]);

export class FieldDefinition {
  uuid: string;
  metadata_uuid: string;
  metadata_name: string;
  table_key: boolean = false;
  label?: string;
  name?: string;
  inputType?: string;
  options?: string[];
  type: string;
  value?: any;
  validations?: Validator[];

  // non usata
  input_disabled: boolean = false;
  function_def?: string;

  sql_type: string;
  sql_definition?: string;
  default_value?: string;
  pattern?: string;
  definition?: string;

  group_name?: string;
  tab_name?: string;


}

