import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: 'app-button',
  template: `
    <div class="demo-full-width margin-top" [formGroup]="group">
      <button type="submit" mat-raised-button color="primary">{{field.label}}</button>
    </div>
  `,
  styles: []
})
export class ButtonComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  constructor() {
  }

  ngOnInit() {
  }
}
