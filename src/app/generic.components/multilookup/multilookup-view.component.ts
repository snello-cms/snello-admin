import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldDefinition } from '../../models/field-definition';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-multilookup-view',
    standalone: true,
    template: `
      @if (values$ | async; as values) {
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}</label>
          <div class="col-sm-9">
            @if (values.length === 0) {
              <span>-</span>
            } @else {
              <div class="multijoin-chip-list">
                @for (c of values; track c.id) {
                  <span class="multijoin-chip">{{ c.label }}</span>
                }
              </div>
            }
          </div>
        </div>
      }
    `,
    styles: [
        `.multijoin-chip-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
        }
        .multijoin-chip {
            display: inline-flex;
            align-items: center;
            border: 1px solid #d8dbe2;
            background: #f5f7fb;
            border-radius: 999px;
            color: #2b2f38;
            font-size: 0.85rem;
            line-height: 1;
            padding: 0.35rem 0.6rem;
        }`
    ],
    imports: [ReactiveFormsModule, AsyncPipe]
})
export class MultiLookupViewComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    values$: Observable<Array<{ id: string, label: string }>>;

    constructor(private apiService: ApiService) {
    }

    ngOnInit() {
        const ids = this.extractIds();
        if (ids.length === 0) {
            this.values$ = of([]);
            return;
        }

        const selectFields = this.buildSelectFields();
        const labelField = this.fetchLabelField();
        this.values$ = this.apiService.fetchObjectsByKeys(
            this.field.join_table_name,
            this.field.join_table_key,
            ids,
            selectFields
        ).pipe(
            map(items => {
                const mapById = new Map<string, string>();
                for (const item of items ?? []) {
                    const id = this.extractJoinKey(item);
                    if (!id) {
                        continue;
                    }
                    let label = id;
                    if (labelField && item?.[labelField] != null && item[labelField] !== '') {
                        label = String(item[labelField]);
                    } else if (this.field.join_table_key && item?.[this.field.join_table_key] != null && item[this.field.join_table_key] !== '') {
                        label = String(item[this.field.join_table_key]);
                    }
                    mapById.set(id, label);
                }

                return ids.map(id => ({
                    id,
                    label: mapById.get(id) ?? id
                }));
            })
        );
    }

    private extractIds(): string[] {
        const rawValue = this.field?.value;
        if (rawValue == null || rawValue === '') {
            return [];
        }

        if (Array.isArray(rawValue)) {
            return rawValue
                .map(value => this.extractJoinKey(value))
                .filter((value): value is string => value != null && value !== '');
        }

        if (typeof rawValue === 'string') {
            return rawValue
                .split(',')
                .map(value => value.trim())
                .filter(Boolean);
        }

        const key = this.extractJoinKey(rawValue);
        return key ? [key] : [];
    }

    private extractJoinKey(value: unknown): string | null {
        if (value == null || value === '') {
            return null;
        }
        if (typeof value !== 'object') {
            return String(value);
        }

        const candidate = value as Record<string, unknown>;
        const keyName = this.field.join_table_key;
        if (keyName && candidate[keyName] != null && candidate[keyName] !== '') {
            return String(candidate[keyName]);
        }
        if (candidate.uuid != null && candidate.uuid !== '') {
            return String(candidate.uuid);
        }
        if (candidate.id != null && candidate.id !== '') {
            return String(candidate.id);
        }
        return null;
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

    private buildSelectFields(): string {
        const fields = new Set<string>();
        (this.field.join_table_select_fields ?? '')
            .split(',')
            .map(field => field.trim())
            .filter(Boolean)
            .forEach(field => fields.add(field));

        if (this.field.join_table_key) {
            fields.add(this.field.join_table_key);
        }

        return Array.from(fields).join(',');
    }
}
