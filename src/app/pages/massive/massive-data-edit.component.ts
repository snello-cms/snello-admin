import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../models/field-definition';
import {ApiService} from '../../services/api.service';
import {MetadataService} from '../../services/metadata.service';
import {Metadata} from '../../models/metadata';
import {MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {PrimeTemplate} from 'primeng/api';
import {CommonModule} from '@angular/common';
import {InputText} from 'primeng/inputtext';
import {DynamicFieldDirective} from '../../generic.components/dynamic-field/dynamic-field.directive';

@Component({
    standalone: true,
    selector: 'app-massive-data-edit',
    templateUrl: './massive-data-edit.component.html',
    styleUrls: ['./massive-data-edit.component.scss'],
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, TableModule, PrimeTemplate, CommonModule, InputText, DynamicFieldDirective]
})
export class MassiveDataEditComponent implements OnInit {

    metadataName: string;
    metadata: Metadata;
    fieldDefinitionsList: FieldDefinition[] = [];
    selectedFields: FieldDefinition[] = [];
    model: any[] = [];
    
    // Track row states
    editingRows: Map<string, boolean> = new Map();
    modifiedRows: Map<string, any> = new Map();
    savingRows: Map<string, boolean> = new Map();
    rowForms: Map<string, UntypedFormGroup> = new Map();
    rowFieldDefinitions: Map<string, Map<string, FieldDefinition>> = new Map();
    
    listSize = 0;
    firstReload = true;
    isLoading = false;
    isSavingAll = false;
    
    searchTerm = '';

    constructor(
        protected router: Router,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private metadataService: MetadataService,
        private fb: UntypedFormBuilder,
        private cdr: ChangeDetectorRef,
        private messageService: MessageService) {
    }
    ngOnInit() {
        this.metadataName = this.route.snapshot.params['name'];

        if (!this.metadataName) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Metadata name not provided'
            });
            this.router.navigate(['/massive/metadata']);
            return;
        }


        // Load metadata
        this.metadataService.buildSearch();
        this.metadataService.search.table_name = this.metadataName;
        this.metadataService.getList().subscribe(
            metadata => {
                if (metadata && metadata.length > 0) {
                    this.metadata = metadata[0];
                }
            }
        );

        // Load field definitions
        this.route.data.subscribe(
            (data: any) => {
                this.fieldDefinitionsList = data?.fieldDefinitionValorized ?? [];

                            // Try to get from navigation state first
                            const navigation = this.router.getCurrentNavigation();
                            if (navigation?.extras.state?.selectedFields) {
                                this.selectedFields = navigation.extras.state.selectedFields;
                            } else {
                                // Fall back to sessionStorage if state is not available
                                const storedUuids = sessionStorage.getItem(`massive_selected_fields_${this.metadataName}`);
                                if (storedUuids) {
                                    try {
                                        const uuids = JSON.parse(storedUuids);
                                        this.selectedFields = this.fieldDefinitionsList.filter(f => uuids.includes(f.uuid));
                                        // Clear the sessionStorage after use
                                        sessionStorage.removeItem(`massive_selected_fields_${this.metadataName}`);
                                    } catch (e) {
                                        console.error('Error parsing selectedFields from sessionStorage', e);
                                    }
                                }
                            }

                            this.cdr.detectChanges();
            }
        );
    }

    loadData(event: any) {
        this.isLoading = true;
        this.apiService._start = event.first;
        this.apiService._limit = event.rows;

        this.apiService.getList(this.metadataName, this.fieldDefinitionsList).subscribe(
            dataList => {
                this.model = dataList;
                this.listSize = this.apiService.listSize;
                this.rowForms.clear();
                this.rowFieldDefinitions.clear();
                this.modifiedRows.clear();
                this.editingRows.clear();
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error loading data'
                });
                this.isLoading = false;
            }
        );
    }

    getTableKeyValue(rowData: any): string {
        if (!this.metadata || !this.metadata.table_key) {
            return '';
        }
        return rowData[this.metadata.table_key];
    }

    isFieldEditableInRow(rowData: any, field: FieldDefinition): boolean {
        return !field.table_key;
    }

    getFieldValue(rowData: any, field: FieldDefinition): any {
        if (!field.name) {
            return '';
        }

        const rowKey = this.getTableKeyValue(rowData);
        const modifiedData = this.modifiedRows.get(rowKey);

        if (modifiedData && modifiedData[field.name] !== undefined) {
            return modifiedData[field.name];
        }

        return rowData[field.name];
    }

    getTableMinWidth(): string {
        const columns = this.selectedFields.length + 2;
        const minWidth = Math.max(1200, columns * 280);
        return `${minWidth}px`;
    }

    getRowFormGroup(rowData: any): UntypedFormGroup {
        const rowKey = this.getTableKeyValue(rowData);
        let rowForm = this.rowForms.get(rowKey);
        if (rowForm) {
            return rowForm;
        }

        rowForm = this.fb.group({});
        const fieldsByUuid = new Map<string, FieldDefinition>();

        for (const field of this.selectedFields) {
            if (!field.name) {
                continue;
            }

            rowForm.addControl(field.name, this.fb.control(this.getFieldValue(rowData, field)));
            const fieldClone: FieldDefinition = {
                ...field,
                value: this.getFieldValue(rowData, field),
                table_name: this.metadataName,
                table_key_value: rowKey,
                is_edit: true,
            };
            fieldsByUuid.set(field.uuid || field.name, fieldClone);
        }

        rowForm.valueChanges.subscribe(values => {
            const existing = this.modifiedRows.get(rowKey) || { ...rowData };
            for (const field of this.selectedFields) {
                if (field.name && Object.prototype.hasOwnProperty.call(values, field.name)) {
                    existing[field.name] = values[field.name];
                }
            }
            this.modifiedRows.set(rowKey, existing);
            this.editingRows.set(rowKey, true);

            const rowFields = this.rowFieldDefinitions.get(rowKey);
            if (rowFields) {
                for (const field of this.selectedFields) {
                    if (!field.name) {
                        continue;
                    }
                    const key = field.uuid || field.name;
                    const toUpdate = rowFields.get(key);
                    if (toUpdate) {
                        toUpdate.value = values[field.name];
                    }
                }
            }
        });

        this.rowForms.set(rowKey, rowForm);
        this.rowFieldDefinitions.set(rowKey, fieldsByUuid);
        return rowForm;
    }

    getFieldForRow(rowData: any, field: FieldDefinition): FieldDefinition {
        const rowKey = this.getTableKeyValue(rowData);
        this.getRowFormGroup(rowData);
        const key = field.uuid || field.name || '';
        const fromCache = this.rowFieldDefinitions.get(rowKey)?.get(key);
        if (fromCache) {
            return fromCache;
        }
        return {
            ...field,
            value: this.getFieldValue(rowData, field),
            table_name: this.metadataName,
            table_key_value: rowKey,
            is_edit: true,
        };
    }

    updateFieldValue(rowData: any, field: FieldDefinition, newValue: any) {
        if (!field.name) {
            return;
        }

        const rowKey = this.getTableKeyValue(rowData);

        if (!this.modifiedRows.has(rowKey)) {
            // Clone the row data for modification
            this.modifiedRows.set(rowKey, { ...rowData });
        }

        const modifiedData = this.modifiedRows.get(rowKey);
        modifiedData[field.name] = newValue;
        this.modifiedRows.set(rowKey, modifiedData);

        if (!this.editingRows.has(rowKey)) {
            this.editingRows.set(rowKey, true);
        }
    }

    saveRow(rowData: any) {
        const rowKey = this.getTableKeyValue(rowData);
        const rowForm = this.getRowFormGroup(rowData);

        if (!this.modifiedRows.has(rowKey) && !rowForm.dirty) {
            this.messageService.add({
                severity: 'info',
                summary: 'No changes',
                detail: 'This row has no modifications.'
            });
            return;
        }

        this.savingRows.set(rowKey, true);
        const dataToSave = this.normalizePayloadForSave({
            ...rowData,
            ...rowForm.value,
            ...(this.modifiedRows.get(rowKey) || {})
        });

        this.apiService.update(this.metadataName, rowKey, dataToSave).subscribe(
            response => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Row saved successfully'
                });
                this.modifiedRows.delete(rowKey);
                this.editingRows.delete(rowKey);
                
                // Update the row in the model
                const index = this.model.findIndex(r => this.getTableKeyValue(r) === rowKey);
                if (index >= 0) {
                    this.model[index] = { ...dataToSave };
                }

                rowForm.patchValue(dataToSave, {emitEvent: false});
                rowForm.markAsPristine();
                rowForm.markAsUntouched();

                this.savingRows.delete(rowKey);
                this.cdr.detectChanges();
            },
            error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error saving row'
                });
                this.savingRows.delete(rowKey);
            }
        );
    }

    saveAllRows() {
        const rowsToSave = this.model.filter(row => {
            const rowKey = this.getTableKeyValue(row);
            const rowForm = this.getRowFormGroup(row);
            return this.modifiedRows.has(rowKey) || rowForm.dirty;
        });

        if (rowsToSave.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'No changes',
                detail: 'There are no modifications to save.'
            });
            return;
        }

        this.isSavingAll = true;
        let savedCount = 0;
        let errorCount = 0;

        rowsToSave.forEach(row => {
            const rowKey = this.getTableKeyValue(row);
            const rowForm = this.getRowFormGroup(row);
            const dataToSave = this.normalizePayloadForSave({
                ...row,
                ...rowForm.value,
                ...(this.modifiedRows.get(rowKey) || {})
            });

            this.apiService.update(this.metadataName, rowKey, dataToSave).subscribe(
                response => {
                    savedCount++;
                    const index = this.model.findIndex(r => this.getTableKeyValue(r) === rowKey);
                    if (index >= 0) {
                        this.model[index] = { ...dataToSave };
                    }
                    rowForm.patchValue(dataToSave, {emitEvent: false});
                    rowForm.markAsPristine();
                    rowForm.markAsUntouched();
                    this.modifiedRows.delete(rowKey);
                    this.editingRows.delete(rowKey);

                    if (savedCount + errorCount === rowsToSave.length) {
                        this.onAllRowsSaved(savedCount, errorCount);
                    }
                },
                error => {
                    errorCount++;
                    if (savedCount + errorCount === rowsToSave.length) {
                        this.onAllRowsSaved(savedCount, errorCount);
                    }
                }
            );
        });
    }

    private onAllRowsSaved(savedCount: number, errorCount: number) {
        this.isSavingAll = false;
        if (errorCount === 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'All rows saved',
                detail: `${savedCount} row(s) saved successfully.`
            });
            this.modifiedRows.clear();
            this.editingRows.clear();
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Partial save',
                detail: `${savedCount} row(s) saved, ${errorCount} error(s).`
            });
        }
        this.cdr.detectChanges();
    }

    saveAndExit() {
        if (this.modifiedRows.size > 0) {
            this.saveAllRows();
            // Give a moment for saves to complete, then navigate
            setTimeout(() => {
                this.router.navigate(['/adminpage']);
            }, 1500);
        } else {
            this.router.navigate(['/adminpage']);
        }
    }

    goBack() {
        if (this.modifiedRows.size > 0) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                this.router.navigate(['/massive/attributes', this.metadataName]);
            }
        } else {
            this.router.navigate(['/massive/attributes', this.metadataName]);
        }
    }

    hasModifications(): boolean {
        return this.modifiedRows.size > 0;
    }

    isRowModified(rowData: any): boolean {
        const rowKey = this.getTableKeyValue(rowData);
        const rowForm = this.rowForms.get(rowKey);
        return this.editingRows.has(rowKey) || !!rowForm?.dirty;
    }

    getDisplayLabel(field: FieldDefinition): string {
        return field.label || field.name || '';
    }

    private normalizePayloadForSave(payload: any): any {
        const normalized = { ...payload };

        for (const field of this.selectedFields) {
            if (!field?.name || field.type !== 'realtionships') {
                continue;
            }
            normalized[field.name] = this.normalizeRelationshipsValue(normalized[field.name]);
        }

        return normalized;
    }

    private normalizeRelationshipsValue(value: unknown): string | null {
        if (value == null) {
            return null;
        }

        if (Array.isArray(value)) {
            return value
                .map(entry => String(entry ?? '').trim())
                .filter(Boolean)
                .join(',');
        }

        if (typeof value === 'string') {
            return value
                .split(',')
                .map(entry => entry.trim())
                .filter(Boolean)
                .join(',');
        }

        return String(value);
    }

}
