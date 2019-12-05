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
import {BASE_PATH} from 'src/app/constants/constants';

@Component({
    selector: 'app-media-view',
    template: `
        <div *ngIf=" uploadedFile != null" class="form-group clearfix row" [formGroup]="group">
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
    `,
    styles: []
})
export class MediaViewComponent implements OnInit {
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

        return this.documentService
            .upload(fileToUpload, this.field.table_name, this.field.table_key_value)
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
