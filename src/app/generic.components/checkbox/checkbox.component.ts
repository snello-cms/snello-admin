import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    selector: "app-checkbox",
    standalone: true,
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field.name }}</label>
      <div class="col-sm-9">
        <p-toggleswitch [formControlName]="field.name">{{
          field.label
        }}</p-toggleswitch>
      </div>
    </div>
  `,
    styles: [],
    imports: [ReactiveFormsModule, ToggleSwitchModule]
})
export class CheckboxComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  constructor() {}

  ngOnInit() {}
}
