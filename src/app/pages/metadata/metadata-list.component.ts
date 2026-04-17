import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../models/metadata';
import {NavigationExtras, Router} from '@angular/router';
import {MetadataService} from '../../services/metadata.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

interface MetadataImportPreviewRow {
    uuid: string;
    tableName: string;
    description: string;
    fieldsCount: number;
    exists: boolean;
    payload: any;
}

@Component({
    standalone: true,
    templateUrl: './metadata-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
export class MetadataListComponent extends AbstractListComponent<Metadata> implements OnInit {
    exportMode = false;
    importMode = false;

    selectedExportUuids: Set<string> = new Set<string>();
    isExporting = false;

    importFileName = '';
    importRawPayload: any;
    importRows: MetadataImportPreviewRow[] = [];
    isLoadingExistingMetadatas = false;
    isImporting = false;

    private existingUuidSet: Set<string> = new Set<string>();
    private existingTableNameSet: Set<string> = new Set<string>();

    constructor(
        public  router: Router,
        public confirmationService: ConfirmationService,
        public service: MetadataService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'metadata');
        this.filters = new Metadata();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    toggleExportMode() {
        this.exportMode = !this.exportMode;
        if (this.exportMode) {
            this.importMode = false;
        }
    }

    toggleImportMode() {
        this.importMode = !this.importMode;
        if (this.importMode) {
            this.exportMode = false;
            this.selectedExportUuids.clear();
        }
    }

    onExportSelectionChange(metadata: Metadata, checked: boolean) {
        if (!metadata?.uuid) {
            return;
        }
        if (checked) {
            this.selectedExportUuids.add(metadata.uuid);
            return;
        }
        this.selectedExportUuids.delete(metadata.uuid);
    }

    isMetadataSelectedForExport(metadata: Metadata): boolean {
        if (!metadata?.uuid) {
            return false;
        }
        return this.selectedExportUuids.has(metadata.uuid);
    }

    areAllVisibleRowsSelected(): boolean {
        const visibleRows = this.model.filter(row => !!row?.uuid);
        if (visibleRows.length === 0) {
            return false;
        }
        return visibleRows.every(row => this.selectedExportUuids.has(row.uuid));
    }

    toggleSelectAllVisibleRows(checked: boolean) {
        for (const row of this.model) {
            if (!row?.uuid) {
                continue;
            }
            if (checked) {
                this.selectedExportUuids.add(row.uuid);
            } else {
                this.selectedExportUuids.delete(row.uuid);
            }
        }
    }

    exportSelectedMetadatas() {
        if (this.selectedExportUuids.size === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Select at least one metadata to export.'
            });
            return;
        }

        this.isExporting = true;
        this.service.exportMetadatas(Array.from(this.selectedExportUuids)).subscribe(
            response => {
                const payload = this.extractExportPayload(response);
                this.downloadJson(payload, `metadatas-export-${new Date().getTime()}.json`);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Export completed successfully.'
                });
                this.isExporting = false;
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Export failed.'
                });
                this.isExporting = false;
            }
        );
    }

    onImportFileSelected(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target?.files?.length) {
            return;
        }

        const file = target.files[0];
        this.importFileName = file.name;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const raw = String(reader.result || '{}');
                const parsed = JSON.parse(raw);
                this.importRawPayload = parsed;
                this.buildImportPreview(parsed);
            } catch (error) {
                this.importRows = [];
                this.importRawPayload = null;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Invalid JSON file.'
                });
            }
        };

        reader.onerror = () => {
            this.importRows = [];
            this.importRawPayload = null;
            this.messageService.add({
                severity: 'error',
                summary: 'Unable to read file.'
            });
        };

        reader.readAsText(file);
    }

    importMetadatasFromFile() {
        if (!this.importRawPayload) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Select a JSON file first.'
            });
            return;
        }

        const payload = this.buildImportPayloadWithoutExisting();
        const pendingRows = this.importRows.filter(row => !row.exists);
        if (pendingRows.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'All metadatas already exist. Nothing to import.'
            });
            return;
        }

        this.isImporting = true;
        this.service.importMetadatas(payload).subscribe(
            response => {
                this.messageService.add({
                    severity: 'success',
                    summary: `Import completed. ${pendingRows.length} metadata(s) sent.`
                });
                this.isImporting = false;
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Import failed.'
                });
                this.isImporting = false;
            }
        );
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    public addField(metadata: Metadata) {
        const navigationExtras: NavigationExtras = {
            queryParams: {'metadata_uuid': metadata.uuid}
        };
        this.router.navigate(['/fielddefinition/new'], navigationExtras);
        return false;
    }

    public createTable(metadata: Metadata) {
        this.service.createTable(metadata).subscribe(
            res => {
                this.reloadListData(metadata, res);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Table created successfully.'
                });
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error creating table.'
                });
            }
        );
    }

    public truncateTable(metadata: Metadata) {
        this.service.truncateTable(metadata.uuid).subscribe(
            res => {
                this.reloadListData(metadata, res);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Table truncated successfully.'
                });
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error truncating table.'
                });
            }
        );
    }

    public deleteTable(metadata: Metadata) {
        this.service.deleteTable(metadata.uuid).subscribe(
            res => {
                this.reloadListData(metadata, res);
                this.messageService.add({
                    severity: 'info',
                    summary: `Table '${metadata.table_name}' deleted successfully.`
                });
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error deleting table.'
                });
            }
        );
    }

    public confirmTruncateTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.truncateTable(metadata);
        }
        this.confirmationService.confirm({
            message: 'do you really want to truncate this table?',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonProps: {
                severity: 'danger',
                outlined: false
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                return this.truncateTable(metadata);
            }
        });
    }

    public confirmCreateTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.createTable(metadata);
        }
        this.confirmationService.confirm({
            message: 'do you really want to create this table',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonProps: {
                severity: 'danger',
                outlined: false
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                return this.createTable(metadata);
            }
        });
    }

    public confirmDeleteTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.deleteTable(metadata);
        }
        this.confirmationService.confirm({
            message: 'do you really want to delete this table',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonProps: {
                severity: 'danger',
                outlined: false
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                return this.deleteTable(metadata);
            }
        });
    }

    private reloadListData(metadata: Metadata, element: Metadata) {
        metadata.created = element.created;
        metadata.already_exist = element.already_exist;
        metadata.table_name = element.table_name;
        metadata.description = element.description;
        metadata.table_key = element.table_key;
        metadata.alias_table = element.alias_table;
        metadata.order_by = element.order_by;
    }


    public view(element: Metadata) {
        this.element = element;
        this.router.navigate(['/' + this.path + '/view', this.getId()]);
    }

    private extractExportPayload(response: any): any {
        if (response == null) {
            return {};
        }

        if (typeof response === 'string') {
            try {
                return JSON.parse(response);
            } catch (error) {
                return {data: response};
            }
        }

        return response;
    }

    private downloadJson(payload: any, fileName: string) {
        const data = JSON.stringify(payload, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
    }

    private buildImportPreview(parsedPayload: any) {
        const metadataList = this.extractMetadataList(parsedPayload);

        if (!metadataList.length) {
            this.importRows = [];
            this.messageService.add({
                severity: 'warn',
                summary: 'No metadatas found in JSON file.'
            });
            return;
        }

        this.isLoadingExistingMetadatas = true;
        this.service.getAllList({}).subscribe(
            existingMetadatas => {
                this.existingUuidSet.clear();
                this.existingTableNameSet.clear();

                for (const metadata of existingMetadatas || []) {
                    const uuid = metadata?.uuid ? String(metadata.uuid) : '';
                    const tableName = metadata?.table_name ? String(metadata.table_name).toLowerCase() : '';
                    if (uuid) {
                        this.existingUuidSet.add(uuid);
                    }
                    if (tableName) {
                        this.existingTableNameSet.add(tableName);
                    }
                }

                this.importRows = metadataList.map(item => this.toImportPreviewRow(item));
                this.isLoadingExistingMetadatas = false;
            },
            err => {
                this.importRows = metadataList.map(item => this.toImportPreviewRow(item, false));
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Could not verify existing metadatas. Import preview may be incomplete.'
                });
                this.isLoadingExistingMetadatas = false;
            }
        );
    }

    private extractMetadataList(parsedPayload: any): any[] {
        if (Array.isArray(parsedPayload)) {
            return parsedPayload;
        }

        if (parsedPayload?.metadatas && Array.isArray(parsedPayload.metadatas)) {
            return parsedPayload.metadatas;
        }

        if (parsedPayload?.metadata && Array.isArray(parsedPayload.metadata)) {
            return parsedPayload.metadata;
        }

        return [];
    }

    private toImportPreviewRow(raw: any, checkExists = true): MetadataImportPreviewRow {
        const uuid = raw?.uuid ? String(raw.uuid) : '';
        const tableName = raw?.table_name ? String(raw.table_name) : '(no table_name)';
        const tableNameKey = tableName.toLowerCase();
        const exists = checkExists
            ? (uuid !== '' && this.existingUuidSet.has(uuid)) || this.existingTableNameSet.has(tableNameKey)
            : false;

        return {
            uuid,
            tableName,
            description: raw?.description || '',
            fieldsCount: Array.isArray(raw?.fields) ? raw.fields.length : 0,
            exists,
            payload: raw
        };
    }

    private buildImportPayloadWithoutExisting(): any {
        const metadatasToImport = this.importRows
            .filter(row => !row.exists)
            .map(row => row.payload);

        if (Array.isArray(this.importRawPayload)) {
            return metadatasToImport;
        }

        if (this.importRawPayload?.metadatas && Array.isArray(this.importRawPayload.metadatas)) {
            return {
                ...this.importRawPayload,
                metadatas: metadatasToImport
            };
        }

        return {
            metadatas: metadatasToImport
        };
    }

}
