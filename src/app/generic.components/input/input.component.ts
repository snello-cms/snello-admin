import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: "app-input",
    standalone: true,
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{field.name}}</label>
      <div class="col-sm-9">
        <input
          pInputText
          [formControlName]="field.name"
          [placeholder]="field.label"
          [type]="field.input_type"
          />
        @for (validation of field.validations; track validation) {
        }
      </div>
    </div>
    `,
    styles: [],
    imports: [ReactiveFormsModule, InputText]
})
export class InputComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  constructor() {}

  ngOnInit() {}
}
