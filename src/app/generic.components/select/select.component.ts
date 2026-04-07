import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {SelectItem} from "primeng/api";
import { DropdownModule } from 'primeng/dropdown';

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
    styles: [],
    imports: [ReactiveFormsModule, DropdownModule]
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
