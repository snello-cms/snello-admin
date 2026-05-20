import {Component, OnInit, ViewChild, DestroyRef, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {ApiService} from '../../services/api.service';
import {DocumentService} from '../../services/document.service';
import {from, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {DomSanitizer} from '@angular/platform-browser';
import {FileUpload} from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import {Document} from '../../models/document';

@Component({
    selector: 'app-media',
    standalone: true,
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
          <div class="col-sm-9">
            <div class="upload-box">
              <p-fileUpload #fileInput mode="basic" [name]="field.name" (onSelect)="uploader($event)" [disabled]="!field.is_edit">
              </p-fileUpload>
            </div>
            <div class="clearfix"></div>
            @if (uploadedFile) {
              <div>
                <br>
                  <div class="clearfix"></div>
                  Uploaded file name: {{uploadedFile.original_name}}
                  <a target="_blank" class="btn btn-default pull-right" href="{{downloadPath()}}">Download</a>
                                    @if (isMp4Video(uploadedFile)) {
                                        <button type="button" class="btn btn-default pull-right" style="margin-right: 8px;" (click)="openVideoPreview()">View video</button>
                                    }
                </div>
              }
            </div>
            @if (!field.is_edit) {
              <div>
                <div class="col-sm-3">
                </div>
                <div class="col-sm-9">
                  <br>
                    Media component is accessible only after the record has been saved
                  </div>
                </div>
              }
            </div>

                <p-dialog
                    [(visible)]="showVideoDialog"
                    [header]="uploadedFile?.original_name || 'Video preview'"
                    [modal]="true"
                    [style]="{ width: '70vw', maxWidth: '960px' }"
                    (onHide)="closeVideoPreview()">
                    @if (uploadedFile) {
                        <video style="width: 100%; height: auto;" controls [src]="downloadPath()">
                            Your browser does not support the video tag.
                        </video>
                    }
                </p-dialog>
        `,
    styles: [],
        imports: [ReactiveFormsModule, FileUpload, DialogModule]
})
export class MediaComponent implements OnInit {
    field: FieldDefinition;

    group: UntypedFormGroup;

    public uploadedFile: Document | null = null;
    public showVideoDialog = false;

    @ViewChild('fileInput', {static: true}) fileInput?: FileUpload;
    private destroyRef = inject(DestroyRef);

    constructor(private apiService: ApiService,
                private documentService: DocumentService,
                private messageService: MessageService,
                public sanitizer: DomSanitizer
    ) {
    }

    ngOnInit() {
        if (this.field.value != null) {
            this.showMedia(this.field.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
                result => {
                    this.fileInput?.clear();
                }
            );
        }
    }

    public uploader(event: { files: File[] }) {
        const selectedFile = event.files?.[0];
        if (!selectedFile) {
            return;
        }
        from(this.uploadFile(selectedFile)).subscribe();
    }

    private uploadFile(fileToUpload: File): Promise<any> {
        const fieldName = this.field.name;
        const tableKeyValue = this.field.table_key_value;
        if (!fieldName || !tableKeyValue) {
            return Promise.resolve();
        }
        const formData = new FormData();
        formData.append('filename', fileToUpload.name);
        formData.append('table_name', tableKeyValue);
        formData.append('table_key', tableKeyValue);
        formData.append('mimeType', fileToUpload.type);
        formData.append('file', fileToUpload);
        return this.documentService.uploadFile(new Document(), formData).toPromise()
            .then(res => {
                this.group.value[fieldName] = res.uuid;
                this.field.value = res.uuid;
                this.uploadedFile = res;
            })
            .catch(error => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Error while loading document ',
                    detail: ''
                });
                return of({});
            });
    }

    public downloadPath() {
        return this.uploadedFile ? this.documentService.downloadPath(this.uploadedFile.uuid) : '';
    }

    public isMp4Video(document: Document | null): boolean {
        return (document?.mimetype || '').toLowerCase() === 'video/mp4';
    }

    public openVideoPreview() {
        if (this.isMp4Video(this.uploadedFile)) {
            this.showVideoDialog = true;
        }
    }

    public closeVideoPreview() {
        this.showVideoDialog = false;
    }

    private showMedia(documentUuid: string): Observable<any> {

        return this.documentService.find(documentUuid)
            .pipe(
                map(
                    document => {
                        this.uploadedFile = document;
                    }
                ),
                catchError((err, caught) => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Error while loading the document',
                        detail: ''
                    });
                    return of({});
                })
            );
    }
}
