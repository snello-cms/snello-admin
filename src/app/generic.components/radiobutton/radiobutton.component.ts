import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: 'app-radiobutton',
  template: `
    <div class="demo-full-width margin-top" [formGroup]="group">
      <label class="radio-label-padding">{{field.label}}:</label>
      <mat-radio-group [formControlName]="field.name">
        <mat-radio-button *ngFor="let item of field.options" [value]="item">{{item}}</mat-radio-button>
      </mat-radio-group>
    </div>
  `,
  styles: []
})
export class RadiobuttonComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  constructor() {
  }

  ngOnInit() {
  }
}
