import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {SelectItem} from "primeng/api";
import { SelectModule } from 'primeng/select';

@Component({
    selector: "app-select",
    standalone: true,
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
      <div class="col-sm-9">
        <p-select
          [options]="options"
          [style]="{ width: '100%' }"
          [placeholder]="field.label"
          [formControlName]="field.name">
        </p-select>
      </div>
    </div>
  `,
    styles: [],
    imports: [ReactiveFormsModule, SelectModule]
})
export class SelectComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  options: SelectItem[] = [];

  constructor() {
  }

  ngOnInit() {
    const valuesSplit = this.field.options?.split(",") ?? [];
    const currValues: SelectItem[] = [];
    for (const value of valuesSplit) {
      currValues.push({label: value, value: value});
    }
    this.options = currValues;
  }
}
