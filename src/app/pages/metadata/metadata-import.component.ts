import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
import {MetadataService} from '../../services/metadata.service';
import {MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {TableModule} from 'primeng/table';
import {PrimeTemplate} from 'primeng/api';
import {MetadataImportPreviewRow} from '../../models/metadata-import-preview-row';

@Component({
    standalone: true,
    templateUrl: './metadata-import.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, TableModule, PrimeTemplate]
})
export class MetadataImportComponent {
    private readonly router = inject(Router);
    private readonly service = inject(MetadataService);
    private readonly messageService = inject(MessageService);

    importFile: File | null = null;
    importFileName = '';
    importPayload: any = null;
    importRows: MetadataImportPreviewRow[] = [];
    isImporting = false;
    /** zip archives are sent as is: no client-side preview, the server reports what it imported */
    isZip = false;
    hasData = false;
    lastResult: any = null;
    /** config tables found in the JSON file: table -> row count */
    configCounts: { table: string; count: number }[] = [];

    /** per-table outcome of the last import: created / updated / errors */
    get configResults(): { table: string; created: number; updated: number; errors: string[] }[] {
        const config = this.lastResult?.config;
        if (!config) {
            return [];
        }
        return Object.keys(config).map(table => ({
            table,
            created: config[table]?.created ?? 0,
            updated: config[table]?.updated ?? 0,
            errors: config[table]?.errors ?? []
        }));
    }

    goToMetadataList() {
        this.router.navigate(['/metadata/list']);
    }

    onImportFileSelected(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target?.files?.length) {
            this.importPayload = null;
            return;
        }

        const file = target.files[0];
        this.importFile = file;
        this.importFileName = file.name;
        this.lastResult = null;
        this.isZip = file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip'
            || file.type === 'application/x-zip-compressed';
        if (this.isZip) {
            this.importPayload = null;
            this.importRows = [];
            this.configCounts = [];
            this.hasData = false;
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const raw = String(reader.result || '{}');
                const parsed = JSON.parse(raw);
                this.importPayload = parsed;
                this.buildImportPreview(parsed);
            } catch (error) {
                this.importRows = [];
                this.importPayload = null;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Invalid JSON file.'
                });
            }
        };

        reader.onerror = () => {
            this.importRows = [];
            this.importPayload = null;
            this.messageService.add({
                severity: 'error',
                summary: 'Unable to read file.'
            });
        };

        reader.readAsText(file);
    }

    uploadImportFile() {
        if (!this.importPayload && !(this.isZip && this.importFile)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Select a file first.'
            });
            return;
        }

        this.isImporting = true;
        const request = this.isZip
            ? this.service.importMetadatasFile(this.importFile as File)
            : this.service.importMetadatas(this.importPayload);
        request.subscribe(
            result => {
                this.lastResult = result;
                const data = result?.data;
                const metadatas = Array.isArray(result?.imported) ? result.imported.length : 0;
                let summary = `Imported ${metadatas} metadata(s).`;
                if (data) {
                    summary += ` Rows: ${data.imported} imported, ${data.skipped} skipped.`;
                }
                const configErrors = this.configResults.reduce((n, r) => n + r.errors.length, 0);
                if (this.configResults.length) {
                    const created = this.configResults.reduce((n, r) => n + r.created, 0);
                    const updated = this.configResults.reduce((n, r) => n + r.updated, 0);
                    summary += ` Configuration: ${created} created, ${updated} updated.`;
                }
                console.info('[import] result', result);
                const rowErrors = Array.isArray(data?.errors) ? data.errors.length : 0;
                const hasErrors = rowErrors + configErrors > 0;
                this.messageService.add({
                    severity: hasErrors ? 'warn' : 'success',
                    summary,
                    detail: hasErrors ? `${rowErrors + configErrors} error(s), see details below.` : undefined
                });
                this.isImporting = false;
            },
            error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Import failed.',
                    detail: typeof error === 'string' ? error : (error?.error ?? undefined)
                });
                this.isImporting = false;
            }
        );
    }

    private buildImportPreview(parsedPayload: any) {
        const metadataList = this.extractMetadataList(parsedPayload);
        const config = parsedPayload?.config ?? {};
        this.configCounts = Object.keys(config)
            .filter(table => Array.isArray(config[table]))
            .map(table => ({table, count: config[table].length}));

        if (!metadataList.length) {
            this.importRows = [];
            this.hasData = false;
            if (!this.configCounts.length) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'No metadatas or configuration found in JSON file.'
                });
            }
            return;
        }

        this.importRows = metadataList.map(raw => {
            const metadataPayload = raw?.metadata ?? raw;
            const fields = Array.isArray(raw?.fields)
                ? raw.fields
                : (Array.isArray(metadataPayload?.fields) ? metadataPayload.fields : []);

            return {
                tableName: metadataPayload?.table_name ? String(metadataPayload.table_name) : '(no table_name)',
                fieldsCount: fields.length,
                dataCount: Array.isArray(raw?.data) ? raw.data.length : null
            };
        });
        this.hasData = this.importRows.some(row => row.dataCount !== null);
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
}
