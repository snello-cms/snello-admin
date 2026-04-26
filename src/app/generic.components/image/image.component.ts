import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDefinition } from '../../models/field-definition';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document';
import { LazyLoadEvent } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule
  ]
})
export class ImageComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  showDialog = false;
  documents: Document[] = [];
  totalRecords = 0;
  loading = false;
  uploadInProgress = false;
  uploadError = '';
  selectedDocument: Document | null = null;
  searchText = '';
  searchTableName = '';
  searchTableKey = '';
  failedPreviewIds = new Set<string>();

  readonly imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
  readonly uploadTypes = ['image/jpeg', 'image/png'];

  private documentService = inject(DocumentService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.loadSelectedDocument();
  }

  openDialog() {
    this.showDialog = true;
    this.documents = [];
    this.totalRecords = 0;
    this.searchText = '';
    this.searchTableName = '';
    this.searchTableKey = '';
    this.loadDocuments({ first: 0, rows: 10 });
  }

  closeDialog() {
    this.showDialog = false;
    this.documents = [];
  }

  get canUpload(): boolean {
    return Boolean(this.field.table_name && this.field.table_key_value);
  }

  loadDocuments(event: LazyLoadEvent) {
    this.loading = true;
    this.documentService.buildSearch();

    // Filter by image types
    this.documentService.search.mimetype_in = this.imageTypes.join(',');

    // Align with backend filters convention used in list pages
    if (this.searchText && this.searchText.trim()) {
      this.documentService.search.original_name_contains = this.searchText.trim();
    }
    if (this.searchTableName && this.searchTableName.trim()) {
      this.documentService.search.table_name_contains = this.searchTableName.trim();
    }
    if (this.searchTableKey && this.searchTableKey.trim()) {
      this.documentService.search.table_key_contains = this.searchTableKey.trim();
    }

    // Apply pagination via service internals (_start/_limit), not search params
    this.documentService._start = event.first || 0;
    this.documentService._limit = event.rows || 10;

    this.documentService.getList().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.documents = data;
        this.totalRecords = this.documentService.getListSize();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectDocument(doc: Document) {
    this.applySelectedDocument(doc);
    this.closeDialog();
  }

  triggerUpload(fileInput: HTMLInputElement) {
    if (!this.canUpload || this.uploadInProgress) {
      return;
    }
    this.uploadError = '';
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];
    input.value = '';

    if (!selectedFile) {
      return;
    }

    if (!this.uploadTypes.includes(selectedFile.type)) {
      this.uploadError = 'Formato non supportato. Carica solo PNG o JPG.';
      return;
    }

    if (!this.canUpload) {
      this.uploadError = 'Salva prima il record per associare l\'immagine.';
      return;
    }

    this.uploadInProgress = true;
    this.uploadError = '';

    this.documentService
      .upload(selectedFile, this.field.table_name as string, this.field.table_key_value as string)
      .then((res) => {
        this.applySelectedDocument(res as Document);
        if (this.showDialog) {
          this.loadDocuments({ first: 0, rows: 10 });
        }
      })
      .catch(() => {
        this.uploadError = 'Error while uploading image.';
      })
      .finally(() => {
        this.uploadInProgress = false;
      });
  }

  loadSelectedDocument() {
      const currentValue = this.field.value || (this.field.name ? this.group.get(this.field.name!)?.value : null);
    if (currentValue) {
      this.documentService.find(currentValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (doc) => {
          this.selectedDocument = doc;
        }
      });
    }
  }

  getDocumentPreview(doc: Document): string {
    return doc.original_name || 'Unknown';
  }

  getPreviewUrl(doc: Document): string {
    return this.documentService.downloadPath(doc.uuid);
  }

  onPreviewError(doc: Document, event?: Event) {
    if (doc?.uuid) {
      this.failedPreviewIds.add(doc.uuid);
    }
    const target = event?.target as HTMLImageElement | undefined;
    if (target) {
      target.style.display = 'none';
    }
  }

  isPreviewAvailable(doc: Document | null): boolean {
    return Boolean(doc?.uuid) && !this.failedPreviewIds.has((doc as Document).uuid);
  }

  onSearchChange() {
    this.documents = [];
    this.totalRecords = 0;
    this.loadDocuments({ first: 0, rows: 10 });
  }

  private applySelectedDocument(doc: Document) {
    this.selectedDocument = doc;
    if (doc?.uuid) {
      this.failedPreviewIds.delete(doc.uuid);
    }
    if (this.field.name) {
      const control = this.group.get(this.field.name!);
      if (control) {
        control.setValue(doc.uuid);
      }
      this.field.value = doc.uuid;
    }
  }
}
