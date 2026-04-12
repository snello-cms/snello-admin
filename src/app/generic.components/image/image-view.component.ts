import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
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
            <span class="image-name">{{ selectedDocument.original_name }}</span>
          </div>
        } @else {
          <span class="text-muted">No image selected</span>
        }
      </div>
    </div>
  `,
  styleUrls: ['./image-view.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ImageViewComponent implements OnInit {
  field!: FieldDefinition;
  group!: UntypedFormGroup;
  selectedDocument: Document | null = null;
  private documentService = inject(DocumentService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    const currentValue = this.field?.value;
    if (currentValue) {
      this.documentService.find(currentValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (doc) => {
          this.selectedDocument = doc;
        }
      });
    }
  }
}
