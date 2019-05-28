import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: "app-checkbox",
  template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field.name }}</label>
      <div class="col-sm-9">
        <p-inputSwitch [formControlName]="field.name">{{
          field.label
        }}</p-inputSwitch>
      </div>
    </div>
  `,
  styles: []
})
export class CheckboxComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  constructor() {}

  ngOnInit() {}
}
