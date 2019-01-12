import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: 'app-textarea',
  template: `
    <mat-form-field class="demo-full-width" [formGroup]="group">
      <textarea matInput [formControlName]="field.name" [placeholder]="field.label"></textarea>
      <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
        <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
      </ng-container>
    </mat-form-field>
  `,
  styles: []
})
export class TextAreaComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  constructor() {
  }

  ngOnInit() {
  }
}
