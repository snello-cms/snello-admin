import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: "app-input",
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
        <ng-container
          *ngFor="let validation of field.validations">

          
        </ng-container>
      </div>
    </div>
  `,
  styles: []
})
export class InputComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  constructor() {}

  ngOnInit() {}
}
