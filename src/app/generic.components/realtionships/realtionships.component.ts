import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FieldDefinition } from '../../model/field-definition';
import { Metadata } from '../../model/metadata';
import { MetadataService } from '../../service/metadata.service';
import { ApiService } from '../../service/api.service';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-realtionships',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
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
                        (onChange)="onMetadataChange($event)">
                    </p-select>
                </div>

                <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
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
    imports: [ReactiveFormsModule, FormsModule, SelectModule, TableModule, DialogModule, CommonModule]
})
export class RealtionshipsComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    dialogVisible = false;
    metadataOptions: Metadata[] = [];
    selectedMetadata: Metadata | null = null;
    rows: any[] = [];
    columns: string[] = [];
    currentValues: string[] = [];

    constructor(private metadataService: MetadataService, private apiService: ApiService) {}

    ngOnInit() {
        this.syncCurrentValues();
        this.loadMetadataOptions();
    }

    openDialog() {
        this.dialogVisible = true;
        if (this.selectedMetadata) {
            this.loadRows(this.selectedMetadata);
        }
    }

    onMetadataChange(event: { value?: Metadata }) {
        const selected = event?.value ?? null;
        this.selectedMetadata = selected;
        if (selected) {
            this.loadRows(selected);
        } else {
            this.rows = [];
            this.columns = [];
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
                this.group.get(fieldName)?.setValue([...this.currentValues]);
            }
            this.field.value = this.currentValues;
        }
        this.dialogVisible = false;
    }

    removeRelationship(value: string) {
        this.currentValues = this.currentValues.filter(rel => rel !== value);
        const fieldName = this.field.name;
        if (fieldName) {
            this.group.get(fieldName)?.setValue([...this.currentValues]);
        }
        this.field.value = this.currentValues;
    }

    private loadMetadataOptions() {
        this.metadataService.getAllList({
            table_name_contains: '',
            uuid: '',
            _limit: 100000
        }).subscribe({
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

        this.apiService.getList(metadata.table_name, []).subscribe({
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
            this.currentValues = value;
        } else if (typeof value === 'string' && value) {
            // Support legacy single-string format
            this.currentValues = [value];
        } else {
            this.currentValues = [];
        }
    }
}
