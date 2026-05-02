import {Component, inject} from '@angular/core';
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
    imports: [SideBarComponent, AdminhomeTopBar, TableModule, PrimeTemplate]
})
export class MetadataImportComponent {
    private readonly router = inject(Router);
    private readonly service = inject(MetadataService);
    private readonly messageService = inject(MessageService);

    importFile: File | null = null;
    importFileName = '';
    importRows: MetadataImportPreviewRow[] = [];
    isImporting = false;

    goToMetadataList() {
        this.router.navigate(['/metadata/list']);
    }

    onImportFileSelected(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target?.files?.length) {
            return;
        }

        const file = target.files[0];
        this.importFile = file;
        this.importFileName = file.name;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const raw = String(reader.result || '{}');
                const parsed = JSON.parse(raw);
                this.buildImportPreview(parsed);
            } catch (error) {
                this.importRows = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Invalid JSON file.'
                });
            }
        };

        reader.onerror = () => {
            this.importRows = [];
            this.messageService.add({
                severity: 'error',
                summary: 'Unable to read file.'
            });
        };

        reader.readAsText(file);
    }

    uploadImportFile() {
        if (!this.importFile) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Select a file first.'
            });
            return;
        }

        this.isImporting = true;
        this.service.importMetadatasFile(this.importFile).subscribe(
            () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Import completed successfully.'
                });
                this.isImporting = false;
            },
            () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Import failed.'
                });
                this.isImporting = false;
            }
        );
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

        this.importRows = metadataList.map(raw => {
            const metadataPayload = raw?.metadata ?? raw;
            const fields = Array.isArray(raw?.fields)
                ? raw.fields
                : (Array.isArray(metadataPayload?.fields) ? metadataPayload.fields : []);

            return {
                tableName: metadataPayload?.table_name ? String(metadataPayload.table_name) : '(no table_name)',
                fieldsCount: fields.length
            };
        });
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
