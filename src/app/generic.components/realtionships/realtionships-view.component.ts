import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDefinition } from '../../model/field-definition';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-realtionships-view',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                @if (values.length > 0) {
                    <div class="p-chips">
                        @for (rel of values; track rel) {
                            <span class="p-chip">
                                <span class="p-chip-label">{{ rel }}</span>
                            </span>
                        }
                    </div>
                } @else {
                    <span class="relationship-empty">-</span>
                }
            </div>
        </div>
    `,
    styles: [
        `
        .p-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            padding: 0.25rem;
        }
        
        .p-chip {
            display: inline-flex;
            align-items: center;
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 0.25rem 0.75rem;
            border-radius: 16px;
            font-size: 0.875rem;
            border: 1px solid #90caf9;
        }
        
        .p-chip-label {
            display: flex;
            align-items: center;
        }
        
        .relationship-empty {
            color: #777777;
        }
        `
    ],
    imports: [ReactiveFormsModule, CommonModule]
})
export class RealtionshipsViewComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;
    values: string[] = [];

    ngOnInit() {
        const fieldName = this.field.name;
        const currentValue = fieldName ? this.group.get(fieldName)?.value : this.field.value;
        
        if (Array.isArray(currentValue)) {
            this.values = currentValue.filter((v: any) => typeof v === 'string');
        } else if (typeof currentValue === 'string' && currentValue) {
            // String separated by comma
            this.values = (<string>currentValue)
                .split(',')
                .map(value => value.trim())
                .filter(Boolean);
        } else {
            this.values = [];
        }
    }
}
