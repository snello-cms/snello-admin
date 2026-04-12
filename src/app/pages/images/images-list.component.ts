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

@Component({
    standalone: true,
    templateUrl: './images-list.component.html',
    imports: [
        CommonModule,
        SideBarComponent,
        AdminhomeTopBar,
        ReactiveFormsModule,
        FormsModule,
        InputText,
        TableModule,
        PrimeTemplate,
        DialogModule
    ]
})
export class ImagesListComponent extends AbstractListComponent<Document> implements OnInit {
    searchOriginalName = '';
    searchTableName = '';
    searchTableKey = '';
    selectedImagePreview: Document | null = null;
    showImageDialog = false;

    readonly imageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff'
    ];

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: DocumentService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'images');
        this.filters = new Document();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    override preLoaddata() {
        this.applyImageFilters();
    }

    override reload(datatable: any) {
        this.applyImageFilters();
        super.reload(datatable);
    }

    override reset(datatable: any) {
        this.searchOriginalName = '';
        this.searchTableName = '';
        this.searchTableKey = '';
        this.service.buildSearch();
        this.applyImageFilters();
        super.refresh(datatable);
    }

    applyImageFilters() {
        if (!this.service.search) {
            this.service.buildSearch();
        }

        this.service.search.mimetype_in = this.imageTypes.join(',');

        if (this.searchOriginalName && this.searchOriginalName.trim()) {
            this.service.search.original_name_contains = this.searchOriginalName.trim();
        } else {
            delete this.service.search.original_name_contains;
        }

        if (this.searchTableName && this.searchTableName.trim()) {
            this.service.search.table_name_contains = this.searchTableName.trim();
        } else {
            delete this.service.search.table_name_contains;
        }

        if (this.searchTableKey && this.searchTableKey.trim()) {
            this.service.search.table_key_contains = this.searchTableKey.trim();
        } else {
            delete this.service.search.table_key_contains;
        }
    }

    editImage(doc: Document) {
        this.router.navigate(['/images/edit', doc.uuid]);
    }

    viewDocument(doc: Document) {
        this.router.navigate(['/document/view', doc.uuid]);
    }

    getFormat(mimetype: string): string {
        if (!mimetype) return '-';
        const format = mimetype.split('/').pop()?.toUpperCase() || '-';
        // Handle specific cases
        if (format === 'JPEG') return 'JPG';
        if (format === 'SVG+XML') return 'SVG';
        return format;
    }

    previewPath(uuid: string) {
        return this.service.downloadPath(uuid);
    }

    openImagePreview(doc: Document) {
        this.selectedImagePreview = doc;
        this.showImageDialog = true;
    }

    closeImagePreview() {
        this.showImageDialog = false;
        this.selectedImagePreview = null;
    }
}
