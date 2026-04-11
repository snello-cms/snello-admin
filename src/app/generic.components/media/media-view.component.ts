import {Component, OnInit, ViewChild} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from '../../service/api.service';
import {DocumentService} from '../../service/document.service';
import {from, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {DomSanitizer} from '@angular/platform-browser';
import {FileUpload} from 'primeng/fileupload';
import {Document} from '../../model/document';

@Component({
    selector: 'app-media-view',
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
                </div>
              </div>
            </div>
          }
        `,
    styles: [],
    imports: [ReactiveFormsModule]
})
export class MediaViewComponent implements OnInit {
    field: FieldDefinition;

    group: UntypedFormGroup;

    public uploadedFile: Document | null = null;

    @ViewChild('fileInput', {static: true}) fileInput: FileUpload;

    constructor(private apiService: ApiService,
                private documentService: DocumentService,
                private messageService: MessageService,
                public sanitizer: DomSanitizer
    ) {
    }

    ngOnInit() {
        if (this.field.value != null) {
            this.showMedia(this.field.value).subscribe(
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
