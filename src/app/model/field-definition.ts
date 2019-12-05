import {Validator} from './validator';

export const MAP_INPUT_TO_FIELD: Map<string, any> = new Map(
  [
    ['string', ['input', 'text']],
    ['number', ['input', 'number']],
    ['decimal', ['input', 'decimal']],
    ['password', ['input', 'password']],
    ['email', ['input', 'email']],
    ['text', ['textarea', null]],
    ['tinymce', ['tinymce', null]],
    ['monaco', ['monaco', null]],
    ['boolean', ['checkbox', null]],
    ['date', ['date', null]],
    ['datetime', ['datetime', null]],
    ['time', ['time', null]],
    ['select', ['select', null]],
    ['media', ['media', null]],
    ['tags', ['tags', null]],
    ['join', ['join', null]],
    ['multijoin', ['multijoin', null]],
    ['media', ['media', null]]


  ]);

export class FieldDefinition {
  uuid: string;
  metadata_uuid: string;
  metadata_name: string;
  table_key = false;
  label?: string;
  name?: string;
  input_type?: string;
  options?: string;
  type: string;
  value?: any;
  validations?: Validator[];

  // non usata
  input_disabled = false;
  function_def?: string;

  sql_type: string;
  sql_definition?: string;
  default_value?: string;
  pattern?: string;
  definition?: string;

  group_name?: string;
  tab_name?: string;

  join_table_name: string;
  join_table_key: string;
  join_table_select_fields: string;

  table_name?: string;
  table_key_value?: string;

  searchable: boolean;

//    static final String EQU = '=';
//    static final String NE = '_ne';
//    static final String LT = '_lt';
//    static final String GT = '_gt';
//    static final String LTE = '_lte';
//    static final String GTE = '_gte';
//    static final String CNT = '_contains';
//    static final String NCNT = '_ncontains';
  search_condition: string;

// composizione del name + la codiione scelta
// -> es: search on 'name': (EQU) name, (LIKE) name_contains,(NOT LIKE) name_ncontains,
// -> es: search on  'age': (EQU) age, (<) age_lt,(>) age_gt, (<=) age_lte, (>=) age_gte
  search_field_name: string;

// definisce se il campo deve essere visto nella lista
  show_in_list: boolean;

  // usato solo lato angular
  is_edit = false;
}

