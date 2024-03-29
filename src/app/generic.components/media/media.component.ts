import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from '../../service/api.service';
import {DocumentService} from '../../service/document.service';
import {from, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {DomSanitizer} from '@angular/platform-browser';
import {FileUpload} from 'primeng/fileupload';
import {Document} from 'src/app/model/document';

@Component({
    selector: 'app-media',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                <div class="upload-box">
                    <p-fileUpload #fileInput mode="basic" [name]="field.name" (onSelect)="uploader($event)" [disabled]="!field.is_edit">
                    </p-fileUpload>
                </div>
                <div class="clearfix"></div>
                <div *ngIf="uploadedFile">
                    <br>
                    <div class="clearfix"></div>
                    Uploaded file name: {{uploadedFile.original_name}}
                    <a target="_blank" class="btn btn-default pull-right" href="{{downloadPath()}}">Download</a>
                </div>
            </div>
            <div *ngIf="!field.is_edit">
                <div class="col-sm-3">
                </div>
                <div class="col-sm-9">
                    <br>
                    Media component is accessible only after the record has been saved
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class MediaComponent implements OnInit {
    field: FieldDefinition;

    group: FormGroup;

    public uploadedFile: Document;

    @ViewChild('fileInput', {static: true}) fileInput: FileUpload;

    constructor(private apiService: ApiService,
                private documentService: DocumentService,
                private messageService: MessageService,
                public sanitizer: DomSanitizer
    ) {
    }

    ngOnInit() {
        this.uploadedFile = null;
        if (this.field.value != null) {
            this.showMedia(this.field.value).subscribe(
                result => {
                    this.fileInput.clear();
                }
            );
        }
    }

    public uploader(event: any) {
        from(this.uploadFile(event.files[0])).subscribe();
    }

    private uploadFile(fileToUpload: FileUpload): Promise<any> {
        const formData = new FormData();
        formData.append('filename', this.fileInput.files[0].name);
        formData.append('table_name', this.field.table_key_value);
        formData.append('table_key', this.field.table_key_value);
        formData.append('mimeType', this.fileInput.files[0].type);
        formData.append('file', this.fileInput.files[0]);
        return this.documentService.uploadFile(new Document(), formData).toPromise()
            .then(res => {
                this.group.value[this.field.name] = res.uuid;
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
        return this.documentService.downloadPath(this.uploadedFile.uuid);
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
                        summary: 'Errore durante il recupero del documento ',
                        detail: ''
                    });
                    return of({});
                })
            );
    }
}
