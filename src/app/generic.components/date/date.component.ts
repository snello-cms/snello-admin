import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { DatePicker } from 'primeng/datepicker';
import {parseTypedDay} from './typed-date.util';

@Component({
    selector: "app-date",
    standalone: true,
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ (field.label || field.name) }}{{ field.mandatory ? '(*)' : '' }}</label>
      <div class="col-sm-9">
        <!-- dd/mm/yy: the same day-first form as the lists and the datetime field -->
        <p-datepicker
          dateFormat="dd/mm/yy"
          placeholder="dd/mm/yyyy"
          appendTo="body"
          [baseZIndex]="2000"
          [formControlName]="field.name"
          (onBlur)="acceptTyped($event)">
        </p-datepicker>
      </div>
    </div>
  `,
    styles: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, DatePicker]
})
export class DateComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  constructor() {
  }

  ngOnInit() {
  }

  /**
   * The picker only understands its own format and silently empties the field on anything else (2025-01-01,
   * 1.1.2025), and it ignores text pasted with the mouse. Its blur event comes before that clean-up, with the
   * text still in the input: a day written in a usual form is taken as the value instead of being thrown away.
   */
  acceptTyped(event: Event) {
    const control = this.field?.name ? this.group?.get(this.field.name) : null;
    const typed = (event?.target as HTMLInputElement | null)?.value ?? '';
    if (!control || !typed.trim()) {
      return;
    }
    const day = parseTypedDay(typed);
    const current = control.value instanceof Date ? control.value : null;
    if (!day) {
      console.warn('[date] typed value not understood, field', this.field.name, ':', typed);
      return;
    }
    // The control already holding a Date is not enough to skip: the picker ignores text that arrives without a
    // key press (mouse paste, drag and drop, autofill) and would put the old day back. Same day = it parsed it.
    if (current && current.getFullYear() === day.getFullYear() && current.getMonth() === day.getMonth()
        && current.getDate() === day.getDate()) {
      return;
    }
    console.debug('[date] typed value accepted, field', this.field.name, ':', typed, '->', day.toDateString());
    control.setValue(day);
    control.markAsDirty();
  }
}
