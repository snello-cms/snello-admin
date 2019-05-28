import {Component, DoCheck, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

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
  styles: []
})
export class TagComponent implements OnInit{
  field: FieldDefinition;
  group: FormGroup;


  constructor() {
  }

  ngOnInit() {
  }

}
