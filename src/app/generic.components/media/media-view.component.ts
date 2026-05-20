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
    selector: 'app-media-view',
    standalone: true,
    template: `
        @if ( uploadedFile != null) {
          <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
              <div class="clearfix"></div>
              <div>
                <br>
                  <div class="clearfix"></div>
                  Uploaded file name: {{uploadedFile.original_name}}
                                    <a target="_blank" class="btn btn-default pull-right" href="{{downloadPath()}}">Download</a>
                                    @if (isMp4Video(uploadedFile)) {
                                        <button type="button" class="btn btn-default pull-right" style="margin-right: 8px;" (click)="openVideoPreview()">View video</button>
                                    }
                </div>
              </div>
            </div>
          }

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
        imports: [ReactiveFormsModule, DialogModule]
})
export class MediaViewComponent implements OnInit {
    field: FieldDefinition;

    group: UntypedFormGroup;

    public uploadedFile: Document | null = null;
    public showVideoDialog = false;

    @ViewChild('fileInput', {static: true}) fileInput: FileUpload;
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
                    if (this.fileInput) {
                        this.fileInput.clear();
                    }
                }
            );
        }
    }

    public uploader(event: any) {
        from(this.uploadFile(event.files[0])).subscribe();
    }

    private uploadFile(fileToUpload: any): Promise<any> {
        const fieldName = this.field.name;
        const tableName = this.field.table_name;
        const tableKey = this.field.table_key_value;
        if (!fieldName || !tableName || !tableKey) {
            return Promise.resolve();
        }

        return this.documentService
            .upload(fileToUpload, tableName, tableKey)
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
