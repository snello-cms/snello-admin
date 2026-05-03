import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { FieldDefinition } from '../../models/field-definition';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document';

@Component({
  selector: 'app-image-view',
  template: `
    <div class="form-group clearfix row">
      <label class="col-sm-3">{{ field.name }}</label>
      <div class="col-sm-9">
        @if (selectedDocument) {
          <div class="image-view">
            @if (isPreviewAvailable(selectedDocument)) {
              <img
                class="selected-thumb"
                [src]="getPreviewUrl(selectedDocument)"
                [alt]="selectedDocument.original_name"
                (click)="openImagePreview()"
                (error)="onPreviewError(selectedDocument, $event)" />
            } @else {
              <span class="no-preview">No preview</span>
            }
          </div>
        } @else {
          <span class="text-muted">No image selected</span>
        }
      </div>
    </div>

    <p-dialog
      [(visible)]="showImageDialog"
      [header]="selectedDocument?.original_name"
      [modal]="true"
      [maximizable]="true"
      [style]="{width: '90vw', height: '90vh'}"
      (onHide)="closeImagePreview()">
      @if (selectedDocument) {
        @if (isPreviewAvailable(selectedDocument)) {
          <img
            class="dialog-image"
            [src]="getPreviewUrl(selectedDocument)"
            [alt]="selectedDocument.original_name"
            (error)="onPreviewError(selectedDocument, $event)" />
        } @else {
          <div class="dialog-no-preview">No preview</div>
        }
      }
    </p-dialog>
  `,
  styleUrls: ['./image-view.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule]
})
export class ImageViewComponent implements OnInit {
  field!: FieldDefinition;
  group!: UntypedFormGroup;
  selectedDocument: Document | null = null;
  showImageDialog = false;
  failedPreviewIds = new Set<string>();
  private documentService = inject(DocumentService);
  private destroyRef = inject(DestroyRef);

  openImagePreview() {
    if (this.selectedDocument && this.isPreviewAvailable(this.selectedDocument)) {
      this.showImageDialog = true;
    }
  }

  closeImagePreview() {
    this.showImageDialog = false;
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

  ngOnInit() {
    const currentValue = this.field?.value || (this.field?.name ? this.group?.get(this.field.name)?.value : null);
    if (currentValue) {
      this.documentService.find(currentValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (doc) => {
          this.selectedDocument = doc;
          if (doc?.uuid) {
            this.failedPreviewIds.delete(doc.uuid);
          }
        }
      });
    }
  }
}
