import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: 'app-checkbox',
  template: `
    <div class="demo-full-width margin-top" [formGroup]="group">
      <mat-checkbox [formControlName]="field.name">{{field.label}}</mat-checkbox>
    </div>
  `,
  styles: []
})
export class CheckboxComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  constructor() {
  }

  ngOnInit() {
  }
}
