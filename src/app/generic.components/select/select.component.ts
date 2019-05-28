import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {SelectItem} from "primeng/api";

@Component({
  selector: "app-select",
  template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field.name }}</label>
      <div class="col-sm-9">
        <p-dropdown
          [options]="options"
          [style]="{ width: '100%' }"
          [placeholder]="field.label"
          [formControlName]="field.name">
        </p-dropdown>
      </div>
    </div>
  `,
  styles: []
})
export class SelectComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  options: SelectItem[] = [];

  constructor() {
  }

  ngOnInit() {
    let valuesSplit = this.field.options.split(",");
    let currValues = [];
    for (let value of valuesSplit) {
      currValues.push({label: value, value: value});
    }
    this.options = currValues;
  }
}
