import {DocumentService} from './../../service/document.service';
import {Document} from './../../model/document';
import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {FileUpload} from 'primeng/fileupload';

@Component({
    templateUrl: './document-edit.component.html',
    styleUrls: ['./document-edit.component.css']
})
export class DocumentEditComponent extends AbstractEditComponent<Document>
    implements OnInit {

    public uploading = false;
    public uploadedFile: string;
    public progress: number;
    public processed = false;
    public okFileList: string[];
    public errorFileList: string[];

    @ViewChild('fup', {static: false})
    fup: FileUpload;


    constructor(
        router: Router,
        route: ActivatedRoute,
        confirmationService: ConfirmationService,
        private documentService: DocumentService,
        public messageService: MessageService) {
        super(router, route, confirmationService, documentService, messageService, 'document');
    }

    createInstance(): Document {
        return new Document();
    }

    ngOnInit() {
        this.element = new Document();
        super.ngOnInit();
    }

    public uploader(event) {
        this.uploading = true;
        this.processed = false;
        this.fup.clear();
        this.okFileList = [];
        this.errorFileList = [];
        this.uploadAllFiles(event.files);
    }

    public resetAll() {
        this.uploading = false;
        this.uploadedFile = null;
        this.processed = false;
        this.errorFileList = [];
        this.okFileList = [];
    }

    private async uploadAllFiles(files) {
        for (const file of files) {
            await this.uploadAFile(file);
        }
        this.uploadedFile = null;
        this.processed = true;
    }

    private uploadAFile(file): Promise<any> {
        this.uploadedFile = file.name;
        return this.documentService
            .upload(file, this.element.table_name, this.element.table_key)
            .then(res => {
                this.okFileList = [this.uploadedFile, ...this.okFileList];
                this.uploading = false;
            })
            .catch(error => {
                this.errorFileList = [this.uploadedFile, ...this.errorFileList];
                this.uploading = false;
            });
    }

    public process() {
        this.fup.upload();
    }

    public get enableProcess(): boolean {
        const ok = this.fup && this.fup.files && this.fup.files.length > 0;
        if (ok) {
            this.messageService.add({
                severity: 'info',
                summary: 'Informazioni: ',
                detail: 'files: ' + this.fup.files.length
            });
        } else {
            this.messageService.add({
                severity: 'info',
                summary: 'Informazioni: ',
                detail: 'no files'
            });
        }
        return ok;
    }

    public onBasicUpload(event: any) {
      this.messageService.add({
        severity: 'info',
        summary: 'Informazioni: ',
        detail: 'event: ' + event
      });
        console.log(event);
    }

}
