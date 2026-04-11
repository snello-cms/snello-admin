import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDefinition } from '../../model/field-definition';
import { splitPath } from '../map-utils';

@Component({
  selector: 'gmappath-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field?.name }}</label>
      <div class="col-sm-9">
        @if (path.length) {
          <div><strong>Selected path:</strong> {{ path.length }} point(s)</div>
          <ul>
            @for (point of path; track $index) {
              <li>{{ point }}</li>
            }
          </ul>
        } @else {
          <span>-</span>
        }
      </div>
    </div>
  `
})
export class GMapPathViewComponent {
  field!: FieldDefinition;
  group!: UntypedFormGroup;

  get currentValue(): string {
    const controlValue = this.field?.name ? this.group?.get(this.field.name)?.value : null;
    return controlValue || this.field?.value || '';
  }

  get path(): string[] {
    return splitPath(this.currentValue);
  }
}
