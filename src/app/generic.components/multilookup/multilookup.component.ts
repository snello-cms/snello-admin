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
    selector: 'app-multilookup',
    standalone: true,
    template: `
      <div class="form-group clearfix row" [formGroup]="group">
        <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
        <div class="col-sm-9">
          @if (selectedItems.length > 0) {
            <div class="multilookup-chip-list">
              @for (item of selectedItems; track item.id) {
                <span class="multilookup-chip">
                  {{ item.label }}
                  <button type="button" class="chip-remove" (click)="removeSelected(item.id)">x</button>
                </span>
              }
            </div>
          } @else {
            <div class="lookup-empty">No values selected</div>
          }

          <div class="lookup-actions">
            <button type="button" class="btn btn-primary" (click)="openDialog()">Select values</button>
            <button type="button" class="btn btn-secondary" (click)="clearAll()" [disabled]="selectedIds.length === 0">Clear</button>
          </div>
        </div>
      </div>

      <p-dialog
        header="Select values"
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

          <div class="table-wrapper clearfix multilookup-table-wrapper">
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
                  (click)="toggleRow(row)"
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

          <div class="dialog-footer-actions">
            <button type="button" class="btn btn-success" (click)="confirmSelection()">Confirm</button>
            <button type="button" class="btn btn-secondary" (click)="cancelSelection()">Cancel</button>
          </div>
        </div>
      </p-dialog>
    `,
    styles: [
        `.multilookup-chip-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 10px;
        }
        .multilookup-chip {
            display: inline-flex;
            align-items: center;
            border: 1px solid #d8dbe2;
            background: #f5f7fb;
            border-radius: 999px;
            color: #2b2f38;
            font-size: 0.85rem;
            line-height: 1;
            padding: 0.35rem 0.6rem;
            gap: 0.5rem;
        }
        .chip-remove {
            border: 0;
            background: transparent;
            padding: 0;
            cursor: pointer;
            color: #6b7280;
        }
        .lookup-empty {
            font-size: 12px;
            color: #777777;
            margin-bottom: 10px;
        }
        .lookup-actions {
            display: flex;
            gap: 8px;
        }
        .dialog-footer-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 10px;
        }
        .multilookup-table-wrapper {
            flex: 1 1 auto;
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        :host ::ng-deep .multilookup-table-wrapper .p-datatable {
            flex: 1 1 auto;
            min-height: 0;
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
export class MultiLookupComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    @ViewChild(DynamicSearchFormComponent) rowSearchForm: DynamicSearchFormComponent;

    dialogVisible = false;
    rows: any[] = [];
    columns: string[] = [];
    rowSearchFields: FieldDefinition[] = [];
    selectedIds: string[] = [];
    selectedItems: Array<{ id: string, label: string }> = [];
    labelField = '';

    private workingSelectedIds = new Set<string>();
    private labelCache = new Map<string, string>();
    private discardChangesOnHide = false;
    private destroyRef = inject(DestroyRef);

    constructor(
        private apiService: ApiService,
        private dataListService: DataListService
    ) {
    }

    ngOnInit() {
        this.labelField = this.fetchLabelField();
        this.syncSelectedIdsFromValue();
        this.refreshSelectedItems();
    }

    openDialog() {
        this.workingSelectedIds = new Set(this.selectedIds);
        this.discardChangesOnHide = false;
        this.dialogVisible = true;
        this.loadRowsSearchAndData();
    }

    onDialogHide() {
        this.dialogVisible = false;
        if (this.discardChangesOnHide) {
            this.discardChangesOnHide = false;
            this.workingSelectedIds = new Set(this.selectedIds);
            return;
        }
        this.applyWorkingSelection();
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

    toggleRow(row: any) {
        const id = this.extractRowId(row);
        if (!id) {
            return;
        }

        if (this.workingSelectedIds.has(id)) {
            this.workingSelectedIds.delete(id);
        } else {
            this.workingSelectedIds.add(id);
        }

        const label = this.extractRowLabel(row, id);
        this.labelCache.set(id, label);
    }

    isSelectedRow(row: any): boolean {
        const id = this.extractRowId(row);
        return !!id && this.workingSelectedIds.has(id);
    }

    confirmSelection() {
        this.applyWorkingSelection();
        this.dialogVisible = false;
    }

    cancelSelection() {
        this.discardChangesOnHide = true;
        this.workingSelectedIds = new Set(this.selectedIds);
        this.dialogVisible = false;
    }

    private applyWorkingSelection() {
        this.selectedIds = Array.from(this.workingSelectedIds);
        this.updateStoredValue();
        this.refreshSelectedItems();
    }

    removeSelected(id: string) {
        this.selectedIds = this.selectedIds.filter(value => value !== id);
        this.updateStoredValue();
        this.refreshSelectedItems();
    }

    clearAll() {
        this.selectedIds = [];
        this.updateStoredValue();
        this.refreshSelectedItems();
    }

    private syncSelectedIdsFromValue() {
        const fieldName = this.field.name;
        const rawValue = fieldName ? this.group.get(fieldName)?.value : this.field.value;

        if (rawValue == null || rawValue === '') {
            this.selectedIds = [];
            this.workingSelectedIds = new Set();
            return;
        }

        if (Array.isArray(rawValue)) {
            this.selectedIds = rawValue
                .map(value => this.extractJoinKey(value))
                .filter((value): value is string => value != null && value !== '');
        } else if (typeof rawValue === 'string') {
            this.selectedIds = rawValue
                .split(',')
                .map(value => value.trim())
                .filter(Boolean);
        } else {
            const keyValue = this.extractJoinKey(rawValue);
            this.selectedIds = keyValue ? [keyValue] : [];
        }

        this.workingSelectedIds = new Set(this.selectedIds);
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

    private updateStoredValue() {
        const serialized = this.selectedIds.join(',');
        if (this.field.name) {
            this.group.get(this.field.name)?.setValue(serialized);
        }
        this.field.value = serialized;
    }

    private refreshSelectedItems() {
        this.selectedItems = this.selectedIds.map(id => ({
            id,
            label: this.labelCache.get(id) ?? id
        }));

        if (this.selectedIds.length > 0) {
            this.loadSelectedLabels(this.selectedIds);
        }
    }

    private loadSelectedLabels(ids: string[]) {
        const selectFields = this.buildSelectFields();
        this.apiService.fetchObjectsByKeys(
            this.field.join_table_name,
            this.field.join_table_key,
            ids,
            selectFields
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (items) => {
                    for (const item of items ?? []) {
                        const id = this.extractRowId(item);
                        if (!id) {
                            continue;
                        }
                        this.labelCache.set(id, this.extractRowLabel(item, id));
                    }
                    this.selectedItems = this.selectedIds.map(id => ({
                        id,
                        label: this.labelCache.get(id) ?? id
                    }));
                },
                error: () => undefined
            });
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
                    const exactTypes = new Set(['number', 'decimal', 'date', 'datetime', 'time', 'boolean', 'select', 'join', 'lookup', 'multijoin', 'multilookup']);
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

    private extractRowId(row: Record<string, any>): string {
        const keyName = this.field.join_table_key || 'uuid';
        const keyValue = row?.[keyName] ?? row?.uuid;
        if (keyValue == null || keyValue === '') {
            return '';
        }
        return String(keyValue);
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
