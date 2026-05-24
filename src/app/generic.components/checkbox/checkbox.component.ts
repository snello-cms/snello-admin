import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: "app-checkbox",
    standalone: true,
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
      <div class="col-sm-9">
        @if (isTriStateSearchField()) {
          <p-checkbox
            [formControlName]="field.name"
            [binary]="true"
            [indeterminate]="isTriStateIndeterminate()"
            (click)="onTriStateClick($event)">
          </p-checkbox>
        } @else {
          <p-toggleswitch [formControlName]="field.name">{{
            field.label
          }}</p-toggleswitch>
        }
      </div>
    </div>
  `,
    styles: [],
    imports: [ReactiveFormsModule, ToggleSwitchModule, CheckboxModule]
})
export class CheckboxComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  constructor() {}

  ngOnInit() {}

  isTriStateSearchField(): boolean {
    const isSearchField = Boolean((this.field as FieldDefinition & { __isSearchField?: boolean }).__isSearchField);
    return isSearchField && this.field.input_type !== 'passivation';
  }

  isTriStateIndeterminate(): boolean {
    const value = this.group?.get(this.field?.name)?.value;
    return value === null || value === undefined || value === '';
  }

  onTriStateClick(event: MouseEvent): void {
    if (!this.isTriStateSearchField()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const control = this.group?.get(this.field?.name);
    if (!control) {
      return;
    }

    const currentValue = control.value;
    let nextValue: boolean | null;
    if (currentValue === null || currentValue === undefined || currentValue === '') {
      nextValue = true;
    } else if (currentValue === true) {
      nextValue = false;
    } else {
      nextValue = null;
    }

    control.setValue(nextValue);
  }
}
