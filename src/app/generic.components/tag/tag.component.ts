import {Component, DoCheck, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import { Chips } from 'primeng/chips';

@Component({
    selector: 'app-tag',
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{field.name}}</label>
      <div class="col-sm-9">
        <p-chips
          [formControlName]="field.name"
        ></p-chips>
      </div>
    </div>

  `,
    styles: [],
    imports: [ReactiveFormsModule, Chips]
})
export class TagComponent implements OnInit{
  field: FieldDefinition;
  group: UntypedFormGroup;


  constructor() {
  }

  ngOnInit() {
  }

}
