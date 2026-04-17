import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FieldDefinition } from '../../models/field-definition';
import { Metadata } from '../../models/metadata';
import { MetadataService } from '../../services/metadata.service';
import { ApiService } from '../../services/api.service';
import { DataListService } from '../../services/data-list.service';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DynamicSearchFormComponent } from '../dynamic-form/dynamic-search-form.component';

@Component({
    selector: 'app-realtionships',
    standalone: true,
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
            <div class="col-sm-9">
                <div class="relationships-chip-wrap">
                    @if (currentValues.length > 0) {
                        @for (rel of currentValues; track rel) {
                            <span class="relationship-chip">
                                {{ rel }}
                                <i class="pi pi-times" (click)="removeRelationship(rel)" style="cursor: pointer; margin-left: 5px;"></i>
                            </span>
                        }
                    } @else {
                        <span class="relationship-empty">No relationships selected</span>
                    }
                </div>
                <button type="button" class="btn btn-warning" (click)="openDialog()">Add Relationship</button>
            </div>
        </div>

        @if (dialogVisible) {
            <p-dialog
                header="Select Relationship"
                [(visible)]="dialogVisible"
                [modal]="true"
                [dismissableMask]="true"
                [maximizable]="true"
                [focusOnShow]="false"
                [style]="{ width: '98vw', height: '95vh' }"
                [contentStyle]="{ padding: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }">

                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>Metadata</label>
                    <p-select
                        [(ngModel)]="selectedMetadata"
                        [ngModelOptions]="{ standalone: true }"
                        [options]="metadataOptions"
                        optionLabel="table_name"
                        [style]="{ width: '100%' }"
                        (onChange)="onMetadataChange()">
                    </p-select>
                </div>

                <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                    @if (selectedMetadata) {
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
                    }

                    @if (rows.length > 0) {
                        <p-table [value]="rows" [paginator]="true" [rows]="20" [scrollable]="true" scrollHeight="flex" styleClass="p-datatable-sm">
                            <ng-template pTemplate="header">
                                <tr>
                                    @for (column of columns; track column) {
                                        <th style="min-width: 120px;">{{ column }}</th>
                                    }
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-row>
                                <tr (click)="selectRow(row)" style="cursor: pointer;" [ngClass]="{ 'highlight-row': true }">
                                    @for (column of columns; track column) {
                                        <td style="min-width: 120px; word-break: break-word;">{{ row[column] }}</td>
                                    }
                                </tr>
                            </ng-template>
                        </p-table>
                    } @else {
                        <p>No data available for selected metadata.</p>
                    }
                </div>
            </p-dialog>
        }
    `,
    styles: [
        `.relationships-chip-wrap {
            margin-bottom: 10px;
        }
        .relationship-chip {
            display: inline-block;
            padding: 4px 10px;
            margin-right: 5px;
            margin-bottom: 5px;
            border-radius: 999px;
            background: #eef2f7;
            color: #34495e;
            font-size: 12px;
        }
        .relationship-empty {
            font-size: 12px;
            color: #777777;
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
        :host ::ng-deep .p-paginator {
            padding: 0.5rem;
        }`
    ],
    imports: [ReactiveFormsModule, FormsModule, SelectModule, TableModule, DialogModule, CommonModule, DynamicSearchFormComponent]
})
export class RealtionshipsComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    @ViewChild(DynamicSearchFormComponent) rowSearchForm: DynamicSearchFormComponent;

    dialogVisible = false;
    metadataOptions: Metadata[] = [];
    selectedMetadata: Metadata | null = null;
    rows: any[] = [];
    columns: string[] = [];
    currentValues: string[] = [];
    rowSearchFields: FieldDefinition[] = [];
    private destroyRef = inject(DestroyRef);

    constructor(
        private metadataService: MetadataService,
        private apiService: ApiService,
        private dataListService: DataListService
    ) {}

    ngOnInit() {
        this.syncCurrentValues();
        this.loadMetadataOptions('');
    }

    openDialog() {
        this.dialogVisible = true;
        if (this.selectedMetadata) {
            this.loadRowsSearchAndData(this.selectedMetadata);
        }
    }

    onMetadataChange() {
        if (this.selectedMetadata) {
            this.loadRowsSearchAndData(this.selectedMetadata);
        } else {
            this.rows = [];
            this.columns = [];
            this.rowSearchFields = [];
        }
    }

    selectRow(row: any) {
        if (!this.selectedMetadata) {
            return;
        }
        const keyName = this.selectedMetadata.table_key || 'uuid';
        const keyValue = row?.[keyName] ?? row?.uuid;
        if (keyValue == null) {
            return;
        }
        const value = `${this.selectedMetadata.table_name}:${keyValue}`;
        
        // Avoid duplicates
        if (!this.currentValues.includes(value)) {
            this.currentValues.push(value);
            const fieldName = this.field.name;
            if (fieldName) {
                this.group.get(fieldName)?.setValue(this.currentValues.join(','));
            }
            this.field.value = this.currentValues.join(',');
        }
        this.dialogVisible = false;
    }

    removeRelationship(value: string) {
        this.currentValues = this.currentValues.filter(rel => rel !== value);
        const fieldName = this.field.name;
        if (fieldName) {
            this.group.get(fieldName)?.setValue(this.currentValues.join(','));
        }
        this.field.value = this.currentValues.join(',');
    }

    onRowsSearchEnter(event: KeyboardEvent) {
        event.preventDefault();
        this.searchRows();
    }

    searchRows() {
        if (!this.selectedMetadata) {
            return;
        }
        this.loadRows(this.selectedMetadata);
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
        if (this.selectedMetadata) {
            this.loadRows(this.selectedMetadata);
        }
    }

    private loadMetadataOptions(tableNameContains: string) {
        this.metadataService.getAllList({
            table_name_contains: tableNameContains,
            uuid: '',
            _limit: 100000
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (metadatas: Metadata[]) => {
                this.metadataOptions = (metadatas ?? []).sort((left, right) =>
                    left.table_name.localeCompare(right.table_name, 'it')
                );
            },
            error: () => {
                this.metadataOptions = [];
                this.selectedMetadata = null;
            }
        });
    }

    private loadRows(metadata: Metadata) {
        const previousStart = this.apiService._start;
        const previousLimit = this.apiService._limit;
        this.apiService._start = 0;
        this.apiService._limit = 50;

        this.preRowsSearch();

        this.apiService.getList(metadata.table_name, this.rowSearchFields).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: rows => {
                this.rows = rows ?? [];
                this.columns = this.getColumns(this.rows, metadata.table_key || 'uuid');
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

    private loadRowsSearchAndData(metadata: Metadata) {
        this.dataListService.getFieldDefinitionList(metadata.table_name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: definitions => {
                this.rowSearchFields = this.buildRowSearchFields(definitions ?? []);
                this.loadRows(metadata);
            },
            error: () => {
                this.rowSearchFields = [];
                this.loadRows(metadata);
            }
        });
    }

    private buildRowSearchFields(definitions: FieldDefinition[]): FieldDefinition[] {
        const candidates = definitions
            .filter(definition => Boolean(definition?.name))
            .map(definition => {
                const normalized = { ...definition };
                if (!normalized.search_field_name || normalized.search_field_name.trim() === '') {
                    const exactTypes = new Set(['number', 'decimal', 'date', 'datetime', 'time', 'boolean', 'select', 'join', 'multijoin']);
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
            if (objToSearch.hasOwnProperty(key)) {
                for (const field of this.rowSearchFields) {
                    if (field.name === key) {
                        const rawValue = objToSearch[field.name];
                        if (field.type === 'join' && field.join_table_key != null && rawValue != null && rawValue !== '') {
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
        return ordered.slice(0, 6);
    }

    private syncCurrentValues() {
        const fieldName = this.field.name;
        const value = fieldName ? this.group.get(fieldName)?.value : this.field.value;
        
        if (Array.isArray(value)) {
            this.currentValues = value
                .filter((entry: unknown): entry is string => typeof entry === 'string')
                .map(entry => entry.trim())
                .filter(Boolean);
        } else if (typeof value === 'string' && value) {
            this.currentValues = value
                .split(',')
                .map(entry => entry.trim())
                .filter(Boolean);
        } else {
            this.currentValues = [];
        }
    }
}
