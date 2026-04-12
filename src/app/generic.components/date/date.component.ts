import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: "app-date",
    standalone: true,
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
      <div class="col-sm-9">
        <p-datepicker
          dateFormat="yy-mm-dd"
          [formControlName]="field.name">
        </p-datepicker>
      </div>
    </div>
  `,
    styles: [],
    imports: [ReactiveFormsModule, DatePicker]
})
export class DateComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  constructor() {
  }

  ngOnInit() {
  }
}
