import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDefinition } from '../../models/field-definition';
import { parsePoint } from '../map-utils';

@Component({
  selector: 'gmaplocation-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field?.name }}</label>
      <div class="col-sm-9">
        @if (currentValue) {
          <div>
            <div><strong>Selected point:</strong> {{ currentValue }}</div>
            @if (mapsUrl) {
              <a [href]="mapsUrl" target="_blank" rel="noopener noreferrer">Open on map</a>
            }
          </div>
        } @else {
          <span>-</span>
        }
      </div>
    </div>
  `
})
export class GMapLocationViewComponent {
  field!: FieldDefinition;
  group!: UntypedFormGroup;

  get currentValue(): string {
    const controlValue = this.field?.name ? this.group?.get(this.field.name)?.value : null;
    return controlValue || this.field?.value || '';
  }

  get mapsUrl(): string | null {
    const point = parsePoint(this.currentValue);
    return point ? `https://www.openstreetmap.org/?mlat=${point[0]}&mlon=${point[1]}#map=15/${point[0]}/${point[1]}` : null;
  }
}
