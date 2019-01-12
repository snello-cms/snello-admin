import {Component, ViewChild} from "@angular/core";
import {Validators} from "@angular/forms";
import {DynamicFormComponent} from "../../generic.components/dynamic-form/dynamic-form.component";
import {FieldDefinition} from "../../model/field-definition";


@Component (
  {
    templateUrl: "./example.component.html",
    styleUrls: ["./example.component.css"]
  }
)
export class ExampleComponent {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  regConfig: FieldDefinition[] = [
    {uuid:"ba92f688-68c4-4440-9486-3a127e2fe0a6",
      metadata_uuid:"a9953cb7-c0f8-4657-9692-db7284871c48",
      metadata_name:"tab_a",
      name:"description",
      label:"description",
      type:"input",
      inputType:"text",
      group_name:"required",
      tab_name:"required",
      table_key:false,
      input_disabled:false,
      sql_type:"varchar(30)"}];

  constructor() {

  }

}
