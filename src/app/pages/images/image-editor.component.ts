import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { DocumentService } from '../../services/document.service';
import { Document as AppDocument } from '../../models/document';
import { CropRect, ResizeHandle } from '../../models/crop-rect';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SideBarComponent,
    AdminhomeTopBar,
    ButtonModule,
    InputNumberModule,
  ],
})
export class ImageEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('imgEl') imgElRef!: ElementRef<HTMLImageElement>;
  @ViewChild('wrapper') wrapperRef!: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly documentService = inject(DocumentService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Document state
  doc: AppDocument | null = null;
  imageUrl = '';
  imageLoaded = false;
  loading = true;
  saving = false;
  previewGenerating = false;
  errorMsg = '';
  previewUrl: string | null = null;
  previewBlob: Blob | null = null;
  previewFilename = '';

  // Natural image dimensions
  naturalW = 0;
  naturalH = 0;
  // Rendered image dimensions (display)
  displayW = 0;
  displayH = 0;

  // Crop rectangle in display pixels
  rect: CropRect = { x: 0, y: 0, w: 0, h: 0 };

  // Manual input fields (in natural image pixels)
  inputW = 0;
  inputH = 0;
  resizePercent = 100;

  // Interaction state
  private dragMode: 'none' | 'move' | 'resize' = 'none';
  private activeHandle: ResizeHandle = 'se';
  private dragStart = { x: 0, y: 0 };
  private rectStart: CropRect = { x: 0, y: 0, w: 0, h: 0 };

  readonly handles: { id: ResizeHandle; label: string }[] = [
    { id: 'nw', label: 'nw' },
    { id: 'n', label: 'n' },
    { id: 'ne', label: 'ne' },
    { id: 'e', label: 'e' },
    { id: 'se', label: 'se' },
    { id: 's', label: 's' },
    { id: 'sw', label: 'sw' },
    { id: 'w', label: 'w' },
  ];

  // Scaling factors: natural px per display px
  get scaleX(): number {
    return this.displayW ? this.naturalW / this.displayW : 1;
  }
  get scaleY(): number {
    return this.displayH ? this.naturalH / this.displayH : 1;
  }

  /** Actual crop width in natural image pixels */
  get actualW(): number {
    return Math.round(this.rect.w * this.scaleX);
  }
  /** Actual crop height in natural image pixels */
  get actualH(): number {
    return Math.round(this.rect.h * this.scaleY);
  }

  get outputW(): number {
    const percent = Math.max(0, Math.min(100, this.resizePercent || 0));
    return Math.round(this.actualW * percent / 100);
  }

  get outputH(): number {
    const percent = Math.max(0, Math.min(100, this.resizePercent || 0));
    return Math.round(this.actualH * percent / 100);
  }

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const uuid = params['uuid'];
      if (uuid) {
        this.loadDocument(uuid);
      }
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.clearPreview();
  }

  private loadDocument(uuid: string) {
    this.loading = true;
    this.documentService
      .find(uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc: AppDocument) => {
          this.doc = doc;
          this.imageUrl = this.documentService.downloadPath(uuid);
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Image not found.';
          this.loading = false;
        },
      });
  }

  onImageLoad() {
    const img = this.imgElRef.nativeElement;
    this.naturalW = img.naturalWidth;
    this.naturalH = img.naturalHeight;
    this.displayW = img.clientWidth;
    this.displayH = img.clientHeight;
    this.imageLoaded = true;
    this.resetRect();
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (!this.imageLoaded) return;
    const img = this.imgElRef.nativeElement;
    const prevScaleX = this.scaleX;
    const prevScaleY = this.scaleY;
    this.displayW = img.clientWidth;
    this.displayH = img.clientHeight;
    // re-scale rect to maintain same natural-pixel selection
    if (this.displayW && this.displayH) {
      this.rect = {
        x: this.rect.x / prevScaleX / (this.naturalW / this.displayW),
        y: this.rect.y / prevScaleY / (this.naturalH / this.displayH),
        w: this.rect.w / prevScaleX / (this.naturalW / this.displayW),
        h: this.rect.h / prevScaleY / (this.naturalH / this.displayH),
      };
    }
  }

  resetRect() {
    this.rect = { x: 0, y: 0, w: this.displayW, h: this.displayH };
    this.syncInputs();
  }

  // ------------------------------------------------------------------ Mouse

  onHandleMousedown(e: MouseEvent, handle: ResizeHandle) {
    e.preventDefault();
    e.stopPropagation();
    this.dragMode = 'resize';
    this.activeHandle = handle;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.rectStart = { ...this.rect };
  }

  onRectMousedown(e: MouseEvent) {
    e.preventDefault();
    this.dragMode = 'move';
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.rectStart = { ...this.rect };
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (this.dragMode === 'none') return;
    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;

    if (this.dragMode === 'move') {
      const nx = Math.max(0, Math.min(this.rectStart.x + dx, this.displayW - this.rect.w));
      const ny = Math.max(0, Math.min(this.rectStart.y + dy, this.displayH - this.rect.h));
      this.rect = { ...this.rect, x: nx, y: ny };
    } else {
      this.applyResize(dx, dy);
    }
    this.syncInputs();
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.dragMode = 'none';
  }

  private applyResize(dx: number, dy: number) {
    const { x, y, w, h } = this.rectStart;
    const minSize = 20;
    let nx = x;
    let ny = y;
    let nw = w;
    let nh = h;

    const handle = this.activeHandle;

    if (handle.includes('e')) nw = Math.max(minSize, w + dx);
    if (handle.includes('s')) nh = Math.max(minSize, h + dy);
    if (handle.includes('w')) {
      nw = Math.max(minSize, w - dx);
      nx = x + w - nw;
    }
    if (handle.includes('n')) {
      nh = Math.max(minSize, h - dy);
      ny = y + h - nh;
    }

    nx = Math.max(0, nx);
    ny = Math.max(0, ny);
    nw = Math.min(nw, this.displayW - nx);
    nh = Math.min(nh, this.displayH - ny);

    this.rect = { x: nx, y: ny, w: nw, h: nh };
  }

  // ------------------------------------------------------------------ Manual input

  private syncInputs() {
    this.inputW = this.actualW;
    this.inputH = this.actualH;
  }

  onInputWChange() {
    if (!this.inputW || this.inputW < 1) return;
    const clamped = Math.min(this.inputW, this.naturalW);
    this.rect = { ...this.rect, w: clamped / this.scaleX };
    this.inputW = clamped;
  }

  onInputHChange() {
    if (!this.inputH || this.inputH < 1) return;
    const clamped = Math.min(this.inputH, this.naturalH);
    this.rect = { ...this.rect, h: clamped / this.scaleY };
    this.inputH = clamped;
  }

  onResizePercentChange() {
    if (this.resizePercent === null || this.resizePercent === undefined || Number.isNaN(this.resizePercent)) {
      this.resizePercent = 100;
      return;
    }
    this.resizePercent = Math.max(0, Math.min(100, Math.round(this.resizePercent)));
  }

  // ------------------------------------------------------------------ Save

  async generatePreview() {
    if (!this.doc || this.previewGenerating || this.saving) return;
    this.previewGenerating = true;
    this.errorMsg = '';

    try {
      const payload = await this.buildProcessedImage();
      this.clearPreview();
      this.previewBlob = payload.blob;
      this.previewFilename = payload.filename;
      this.previewUrl = URL.createObjectURL(payload.blob);
    } catch (error: any) {
      this.errorMsg = error?.message || 'Error while generating preview.';
    } finally {
      this.previewGenerating = false;
    }
  }

  confirmReplaceCurrentImage() {
    if (!this.doc || !this.previewBlob || this.saving) return;
    this.saving = true;
    this.errorMsg = '';

    const filename = this.doc.original_name || this.previewFilename || 'image.png';
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('table_name', this.doc.table_name || '');
    formData.append('table_key', this.doc.table_key || '');
    formData.append('mimeType', this.previewBlob.type || 'image/png');
    formData.append('file', this.previewBlob, filename);

    const queries: any = {};
    // Pass current document to keep the same uuid (PUT update).
    queries[filename] = this.documentService.uploadFile(this.doc, formData).pipe(
      catchError(() => of(null)),
    );

    forkJoin(queries)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (queriesResponse) => {
          const result = queriesResponse[filename];
          if (result === null) {
            this.saving = false;
            this.errorMsg = 'Error while saving.';
            return;
          }

          // Reset formats so the server regenerates all format variants (webp, resized, etc.)
          const updatedDoc = { ...this.doc!, formats: '' };
          this.documentService.update(updatedDoc).pipe(
            catchError(() => of(null)),
            takeUntilDestroyed(this.destroyRef),
          ).subscribe(() => {
            this.saving = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Image updated',
              detail: filename,
            });
            this.refreshCurrentImage();
          });
        },
        error: () => {
          this.saving = false;
          this.errorMsg = 'Error while saving.';
        },
      });
  }

  discardPreview() {
    this.clearPreview();
  }

  saveResized() {
    void this.generatePreview();
  }

  private buildProcessedImage(): Promise<{ blob: Blob; filename: string; outW: number; outH: number }> {
    return new Promise((resolve, reject) => {
      if (!this.doc) {
        reject(new Error('Image not found.'));
        return;
      }

      const img = this.imgElRef.nativeElement;
      const sx = Math.round(this.rect.x * this.scaleX);
      const sy = Math.round(this.rect.y * this.scaleY);
      const sw = this.actualW;
      const sh = this.actualH;

      if (sw <= 0 || sh <= 0) {
        reject(new Error('Invalid dimensions.'));
        return;
      }

      const percent = Math.max(0, Math.min(100, this.resizePercent));
      if (percent <= 0) {
        reject(new Error('Resize percentage must be greater than 0.'));
        return;
      }

      const outW = Math.max(1, Math.round(sw * percent / 100));
      const outH = Math.max(1, Math.round(sh * percent / 100));

      const canvas = window.document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable.'));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Error while generating image.'));
          return;
        }

        const baseName = (this.doc!.original_name || 'image').replace(/\.[^.]+$/, '');
        const filename = `${baseName}_${outW}x${outH}.png`;
        resolve({ blob, filename, outW, outH });
      }, 'image/png');
    });
  }

  private clearPreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.previewBlob = null;
    this.previewFilename = '';
  }

  private refreshCurrentImage() {
    if (!this.doc?.uuid) {
      return;
    }
    this.imageLoaded = false;
    this.clearPreview();
    this.imageUrl = `${this.documentService.downloadPath(this.doc.uuid)}?t=${Date.now()}`;
  }

  goBack() {
    this.router.navigate(['/images/list']);
  }
}
