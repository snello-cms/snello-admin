import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FieldDefinition } from '../../models/field-definition';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-lookup-view',
    standalone: true,
    template: `
      @if (value$ | async; as value) {
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}</label>
          <div class="col-sm-9">
            {{ value }}
          </div>
        </div>
      }
    `,
    styles: [],
    imports: [ReactiveFormsModule, AsyncPipe]
})
export class LookupViewComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    value$: Observable<string>;

    constructor(private apiService: ApiService) {
    }

    ngOnInit() {
        const keyValue = this.extractKeyValue();
        if (!keyValue) {
            this.value$ = of('');
            return;
        }

        const labelField = this.fetchLabelField();
        const selectFields = this.buildSelectFields(labelField);
        this.value$ = this.apiService.fetchObject(this.field.join_table_name, keyValue, selectFields)
            .pipe(
                tap(() => {
                    if (this.field.name) {
                        this.group.get(this.field.name)?.setValue(keyValue);
                    }
                }),
                map(item => {
                    if (!item) {
                        return keyValue;
                    }
                    if (labelField && item[labelField] != null && item[labelField] !== '') {
                        return String(item[labelField]);
                    }
                    if (this.field.join_table_key && item[this.field.join_table_key] != null && item[this.field.join_table_key] !== '') {
                        return String(item[this.field.join_table_key]);
                    }
                    return keyValue;
                })
            );
    }

    private extractKeyValue(): string {
        const rawValue = this.field?.value;
        if (rawValue == null || rawValue === '') {
            return '';
        }
        if (typeof rawValue === 'object') {
            const key = this.field.join_table_key;
            const candidate = rawValue?.[key] ?? rawValue?.uuid ?? '';
            return candidate ? String(candidate) : '';
        }
        return String(rawValue);
    }

    private fetchLabelField(): string {
        const fields = (this.field.join_table_select_fields ?? '')
            .split(',')
            .map(field => field.trim())
            .filter(Boolean);

        const first = fields[0] ?? this.field.join_table_key;
        if (first === this.field.join_table_key && fields.length > 1) {
            return fields[1];
        }
        return first;
    }

    private buildSelectFields(labelField: string): string {
        const fields = new Set<string>();
        if (labelField) {
            fields.add(labelField);
        }
        if (this.field.join_table_key) {
            fields.add(this.field.join_table_key);
        }
        return Array.from(fields).join(',');
    }
}