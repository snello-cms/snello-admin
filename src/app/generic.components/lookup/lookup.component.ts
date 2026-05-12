import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FieldDefinition } from '../../models/field-definition';
import { ApiService } from '../../services/api.service';
import { DataListService } from '../../services/data-list.service';
import { DynamicSearchFormComponent } from '../dynamic-form/dynamic-search-form.component';

@Component({
    selector: 'app-lookup',
    standalone: true,
    template: `
      <div class="form-group clearfix row" [formGroup]="group">
        <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
        <div class="col-sm-9">
          <div class="lookup-current-wrap">
            @if (currentLabel) {
              <div class="lookup-current-value">
                {{ currentLabel }}
                @if (currentValue) {
                  <span class="lookup-id">(id: {{ currentValue }})</span>
                }
              </div>
            } @else if (currentValue) {
              <div class="lookup-current-value">Selected id: {{ currentValue }}</div>
            } @else {
              <div class="lookup-empty">No value selected</div>
            }
          </div>

          <div class="lookup-actions">
            <button type="button" class="btn btn-primary" (click)="openDialog()">Select value</button>
            <button type="button" class="btn btn-secondary" (click)="clearValue()" [disabled]="!currentValue">Clear</button>
          </div>
        </div>
      </div>

      <p-dialog
        header="Select value"
        [(visible)]="dialogVisible"
        [modal]="true"
        [dismissableMask]="true"
        [maximizable]="true"
        [focusOnShow]="false"
        [style]="{ width: '98vw', height: '95vh' }"
        [contentStyle]="{ padding: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }"
        (onHide)="onDialogHide()">

        <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
          <div class="filter-wrapper" style="margin-bottom: .75rem;" (keydown.enter)="onRowsSearchEnter($event)">
            <div class="fw-search-fields">
              @if (rowSearchFields.length > 0) {
                <dynamic-search-form [fields]="rowSearchFields"></dynamic-search-form>
              } @else {
                <div style="font-size: .9rem; color: #666;">No searchable fields configured for this metadata.</div>
              }
            </div>
            <div class="fw-spacer"></div>
            <div class="fw-actions">
              <div class="btn-group">
                <button type="button" class="btn btn-search" (click)="searchRows()">Search</button>
                <button type="button" class="btn btn-reset" (click)="resetRowsSearch()">Undo</button>
              </div>
            </div>
          </div>

                    <div class="table-wrapper clearfix">
                        <p-table
                            [value]="rows"
                            [paginator]="true"
                            [rows]="10"
                            [resizableColumns]="true"
                            [scrollable]="true"
                            scrollHeight="flex"
                            styleClass="p-datatable-sm">
                            <ng-template pTemplate="header">
                                <tr class="sort-header">
                                    <th pResizableColumn>Index</th>
                                    @for (column of columns; track column) {
                                        <th pResizableColumn style="min-width: 120px;">{{ column }}</th>
                                    }
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td [attr.colspan]="columns.length + 1">No results.</td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-row let-rowIndex="rowIndex">
                                <tr
                                    (click)="selectRow(row)"
                                    style="cursor: pointer;"
                                    [ngClass]="{
                                        'highlight-row': true,
                                        'selected-row': isSelectedRow(row)
                                    }">
                                    <td class="RowIndex">{{ rowIndex + 1 }}</td>
                                    @for (column of columns; track column) {
                                        <td style="min-width: 120px; word-break: break-word;">{{ row[column] }}</td>
                                    }
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
        </div>
      </p-dialog>
    `,
    styles: [
        `.lookup-current-wrap {
            margin-bottom: 10px;
        }
        .lookup-current-value {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            background: #eef2f7;
            color: #34495e;
            font-size: 12px;
        }
        .lookup-id {
            margin-left: 6px;
            color: #6b7280;
        }
        .lookup-empty {
            font-size: 12px;
            color: #777777;
        }
        .lookup-actions {
            display: flex;
            gap: 8px;
        }
        :host ::ng-deep .p-datatable {
            font-size: 0.875rem;
        }
        :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            padding: 0.5rem;
            background-color: #f5f5f5;
        }
        :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.5rem;
            max-width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        :host ::ng-deep .highlight-row:hover {
            background-color: #e3f2fd !important;
        }
        :host ::ng-deep .selected-row {
            background-color: #dbeafe !important;
        }
        :host ::ng-deep .p-paginator {
            padding: 0.5rem;
        }`
    ],
    imports: [ReactiveFormsModule, FormsModule, DialogModule, TableModule, CommonModule, DynamicSearchFormComponent]
})
export class LookupComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    @ViewChild(DynamicSearchFormComponent) rowSearchForm: DynamicSearchFormComponent;

    dialogVisible = false;
    rows: any[] = [];
    columns: string[] = [];
    rowSearchFields: FieldDefinition[] = [];
    currentValue = '';
    currentLabel = '';
    labelField = '';

    private destroyRef = inject(DestroyRef);

    constructor(
        private apiService: ApiService,
        private dataListService: DataListService
    ) {
    }

    ngOnInit() {
        this.labelField = this.fetchLabelField();
        this.syncCurrentValue();
        if (this.currentValue) {
            this.loadCurrentLabel(this.currentValue);
        }
    }

    openDialog() {
        this.dialogVisible = true;
        this.loadRowsSearchAndData();
    }

    onDialogHide() {
        this.dialogVisible = false;
    }

    onRowsSearchEnter(event: KeyboardEvent) {
        event.preventDefault();
        this.searchRows();
    }

    searchRows() {
        this.loadRows();
    }

    resetRowsSearch() {
        for (const field of this.rowSearchFields) {
            field.value = null;
        }
        if (this.rowSearchForm?.searchForm) {
            const resetValue: Record<string, unknown> = {};
            for (const field of this.rowSearchFields) {
                if (field.name) {
                    resetValue[field.name] = null;
                }
            }
            this.rowSearchForm.searchForm.setValue(resetValue);
        }
        this.loadRows();
    }

    selectRow(row: any) {
        const keyName = this.field.join_table_key || 'uuid';
        const keyValue = row?.[keyName] ?? row?.uuid;
        if (keyValue == null || keyValue === '') {
            return;
        }

        const normalized = String(keyValue);
        this.currentValue = normalized;
        this.currentLabel = this.extractRowLabel(row, normalized);

        if (this.field.name) {
            this.group.get(this.field.name)?.setValue(normalized);
        }
        this.field.value = normalized;
        this.dialogVisible = false;
    }

    isSelectedRow(row: any): boolean {
        const keyName = this.field.join_table_key || 'uuid';
        const rowValue = row?.[keyName] ?? row?.uuid;
        if (rowValue == null || rowValue === '') {
            return false;
        }
        return String(rowValue) === this.currentValue;
    }

    clearValue() {
        this.currentValue = '';
        this.currentLabel = '';
        if (this.field.name) {
            this.group.get(this.field.name)?.setValue(null);
        }
        this.field.value = null;
    }

    private syncCurrentValue() {
        const fieldName = this.field.name;
        const rawValue = fieldName ? this.group.get(fieldName)?.value : this.field.value;
        if (rawValue == null || rawValue === '') {
            this.currentValue = '';
            return;
        }

        this.currentValue = typeof rawValue === 'object'
            ? String(rawValue[this.field.join_table_key] ?? rawValue.uuid ?? '')
            : String(rawValue);
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

    private loadCurrentLabel(keyValue: string) {
        const selectFields = this.buildSelectFields();
        this.apiService.fetchObject(this.field.join_table_name, keyValue, selectFields)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (item) => {
                    if (!item) {
                        this.currentLabel = keyValue;
                        return;
                    }
                    this.currentLabel = this.extractRowLabel(item, keyValue);
                },
                error: () => {
                    this.currentLabel = keyValue;
                }
            });
    }

    private loadRowsSearchAndData() {
        this.dataListService.getFieldDefinitionList(this.field.join_table_name)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: definitions => {
                    this.rowSearchFields = this.buildRowSearchFields(definitions ?? []);
                    this.loadRows();
                },
                error: () => {
                    this.rowSearchFields = [];
                    this.loadRows();
                }
            });
    }

    private loadRows() {
        const previousStart = this.apiService._start;
        const previousLimit = this.apiService._limit;
        this.apiService._start = 0;
        this.apiService._limit = 50;

        this.preRowsSearch();

        this.apiService.getList(this.field.join_table_name, this.rowSearchFields)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: rows => {
                    this.rows = rows ?? [];
                    this.columns = this.getColumns(this.rows, this.field.join_table_key || 'uuid');
                    this.apiService._start = previousStart;
                    this.apiService._limit = previousLimit;
                },
                error: () => {
                    this.rows = [];
                    this.columns = [];
                    this.apiService._start = previousStart;
                    this.apiService._limit = previousLimit;
                }
            });
    }

    private buildRowSearchFields(definitions: FieldDefinition[]): FieldDefinition[] {
        const candidates = definitions
            .filter(definition => Boolean(definition?.name))
            .map(definition => {
                const normalized = {...definition};
                if (!normalized.search_field_name || normalized.search_field_name.trim() === '') {
                    const exactTypes = new Set(['number', 'decimal', 'date', 'datetime', 'time', 'boolean', 'select', 'join', 'lookup', 'multijoin']);
                    normalized.search_field_name = exactTypes.has(normalized.type)
                        ? String(normalized.name)
                        : `${normalized.name}_contains`;
                }
                return normalized;
            });

        const searchable = candidates.filter(definition => definition.searchable === true);
        return searchable.length > 0 ? searchable : candidates;
    }

    private preRowsSearch() {
        if (!this.rowSearchForm?.value) {
            return;
        }

        const objToSearch = JSON.parse(JSON.stringify(this.rowSearchForm.value));
        for (const key in objToSearch) {
            if (!Object.prototype.hasOwnProperty.call(objToSearch, key)) {
                continue;
            }
            for (const field of this.rowSearchFields) {
                if (field.name !== key) {
                    continue;
                }
                const rawValue = objToSearch[field.name];
                if ((field.type === 'join' || field.type === 'lookup') && field.join_table_key != null && rawValue != null && rawValue !== '') {
                    field.value = typeof rawValue === 'object'
                        ? rawValue[field.join_table_key]
                        : rawValue;
                    continue;
                }

                if (field.type === 'multijoin') {
                    if (Array.isArray(rawValue)) {
                        const values = rawValue
                            .map(value => typeof value === 'object' && value != null && field.join_table_key
                                ? value[field.join_table_key]
                                : value)
                            .filter(value => value != null && value !== '');
                        field.value = values.join(',');
                    } else {
                        field.value = rawValue;
                    }
                    continue;
                }

                field.value = rawValue;
            }
        }
    }

    private getColumns(rows: any[], keyColumn: string): string[] {
        if (!rows || rows.length === 0) {
            return [];
        }
        const allColumns = Object.keys(rows[0] ?? {});
        const ordered = allColumns.includes(keyColumn)
            ? [keyColumn, ...allColumns.filter(column => column !== keyColumn)]
            : allColumns;
        return ordered;
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

    private extractRowLabel(row: Record<string, any>, fallback: string): string {
        if (this.labelField && row?.[this.labelField] != null && row[this.labelField] !== '') {
            return String(row[this.labelField]);
        }
        if (this.field.join_table_key && row?.[this.field.join_table_key] != null && row[this.field.join_table_key] !== '') {
            return String(row[this.field.join_table_key]);
        }
        return fallback;
    }
}