import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Metadata} from '../../models/metadata';
import {MetadataService} from '../../services/metadata.service';
import {MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {TableModule} from 'primeng/table';
import {PrimeTemplate} from 'primeng/api';

@Component({
    standalone: true,
    templateUrl: './metadata-export.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, TableModule, PrimeTemplate]
})
export class MetadataExportComponent implements OnInit {
    model: Metadata[] = [];
    isLoading = false;
    isExporting = false;
    selectedExportUuids: Set<string> = new Set<string>();

    constructor(
        private readonly router: Router,
        private readonly service: MetadataService,
        private readonly messageService: MessageService
    ) {
    }

    ngOnInit() {
        this.loadMetadatas();
    }

    goToMetadataList() {
        this.router.navigate(['/metadata/list']);
    }

    loadMetadatas() {
        this.isLoading = true;
        this.service.getAllList({}).subscribe(
            rows => {
                this.model = rows || [];
                this.isLoading = false;
            },
            () => {
                this.model = [];
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Unable to load metadata list.'
                });
            }
        );
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

    get selectedMetadatas(): Metadata[] {
        return this.model.filter(row => !!row?.uuid && this.selectedExportUuids.has(row.uuid));
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
            () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Export failed.'
                });
                this.isExporting = false;
            }
        );
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
}
