import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractListComponent } from '../../common/abstract-list-component';
import { Document } from '../../models/document';
import { DocumentService } from '../../services/document.service';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { Router } from '@angular/router';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CopyClipboardDirective } from '../../directives/copy-clipboard.directive';

@Component({
    standalone: true,
    templateUrl: './videos-list.component.html',
    imports: [
        CommonModule,
        SideBarComponent,
        AdminhomeTopBar,
        ReactiveFormsModule,
        FormsModule,
        InputText,
        TableModule,
        PrimeTemplate,
        DialogModule,
        CopyClipboardDirective
    ]
})
export class VideosListComponent extends AbstractListComponent<Document> implements OnInit {
    searchOriginalName = '';
    searchTableName = '';
    searchTableKey = '';
    selectedVideoPreview: Document | null = null;
    showVideoDialog = false;
    videoLoopEnabled = true;
    failedPreviewIds = new Set<string>();

    private readonly videoMimeType = 'video/mp4';

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: DocumentService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'videos');
        this.filters = new Document();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    override preLoaddata() {
        this.applyVideoFilters();
    }

    override reload(datatable: any) {
        this.applyVideoFilters();
        super.reload(datatable);
    }

    override reset(datatable: any) {
        this.searchOriginalName = '';
        this.searchTableName = '';
        this.searchTableKey = '';
        this.service.buildSearch();
        this.applyVideoFilters();
        super.refresh(datatable);
    }

    applyVideoFilters() {
        if (!this.service.search) {
            this.service.buildSearch();
        }

        this.service.search.mimetype_in = this.videoMimeType;

        if (this.searchOriginalName && this.searchOriginalName.trim()) {
            this.service.search.original_name_contains = this.searchOriginalName.trim();
        } else {
            delete this.service.search.original_name_contains;
        }

        if (this.searchTableKey && this.searchTableKey.trim()) {
            this.service.search.table_key_contains = this.searchTableKey.trim();
        } else {
            delete this.service.search.table_key_contains;
        }

        if (this.searchTableName && this.searchTableName.trim()) {
            this.service.search.table_name_contains = this.searchTableName.trim();
        } else {
            delete this.service.search.table_name_contains;
        }
    }

    openVideoPreview(doc: Document) {
        this.selectedVideoPreview = doc;
        this.videoLoopEnabled = true;
        this.showVideoDialog = true;
    }

    closeVideoPreview() {
        this.showVideoDialog = false;
        this.selectedVideoPreview = null;
        this.videoLoopEnabled = true;
    }

    previewPath(uuid: string) {
        return this.service.downloadPath(uuid);
    }

    download(uuid: string): void {
        this.service.simplDownload(uuid).subscribe(response => {
            const newBlob = new Blob([(response)], { type: 'application/octet-stream' });
            const nav = window.navigator as Navigator & { msSaveOrOpenBlob?: (blob: Blob) => void };
            if (nav.msSaveOrOpenBlob) {
                nav.msSaveOrOpenBlob(newBlob);
                return;
            }

            const downloadURL = URL.createObjectURL(response);
            window.open(downloadURL);
        });
    }

    downloadPath(uuid: string) {
        return this.service.downloadPath(uuid);
    }

    notify(info: string) {
        this.messageService.add({
            severity: 'info',
            summary: `'${info}' has been copied to clipboard`
        });
    }

    onVideoThumbLoadedMetadata(video: HTMLVideoElement) {
        // Seek a bit forward to increase chance of showing a real frame instead of black.
        try {
            video.currentTime = 0.1;
        } catch {
            // Ignore seek errors; browser policies differ.
        }
    }

    onVideoThumbSeeked(video: HTMLVideoElement) {
        video.pause();
    }

    onVideoThumbError(doc: Document) {
        if (doc?.uuid) {
            this.failedPreviewIds.add(doc.uuid);
        }
    }

    hasVideoPreview(doc: Document): boolean {
        return Boolean(doc?.uuid) && !this.failedPreviewIds.has(doc.uuid);
    }

    setSearchTableNameFromRow(tableName: string | undefined, datatable: any) {
        this.searchTableName = tableName || '';
        this.reload(datatable);
    }

    setSearchTableKeyFromRow(tableKey: string | undefined, datatable: any) {
        this.searchTableKey = tableKey || '';
        this.reload(datatable);
    }

    formatCreationDate(value?: string): string {
        if (!value) {
            return '-';
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat('it-IT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(parsed);
    }
}