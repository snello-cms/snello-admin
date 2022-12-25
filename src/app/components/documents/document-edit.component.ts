import {DocumentService} from './../../service/document.service';
import {Document} from './../../model/document';
import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {FileUpload} from 'primeng/fileupload';

@Component({
    templateUrl: './document-edit.component.html',
})
export class DocumentEditComponent extends AbstractEditComponent<Document>
    implements OnInit {

    public uploading = false;
    public uploadedFile: string;
    public progress: number;
    public processed = false;


    public displayProgressBar: boolean;

    @ViewChild('fileUploader', { static: false }) fileUploader: FileUpload = null;


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
    uploadFiles(): void {
        this.displayProgressBar = true;

        if (!this.fileUploader) {
            this.displayProgressBar = false;
            return;
        }

        if (this.fileUploader && this.fileUploader.files.length > 0) {
            const formData = new FormData();

            formData.append('filename', this.fileUploader.files[0].name);
            formData.append('table_name', this.element.table_name);
            formData.append('table_key', this.element.table_key);
            if (this.fileUploader.files[0].type) {
                formData.append('mimeType', this.fileUploader.files[0].type);
            } else {
                formData.append('mimeType', 'application/octet-stream');
            }
            formData.append('file', this.fileUploader.files[0]);
            this.documentService.uploadFile(this.element, formData).subscribe(
                ok => {
                    this.addInfo('File caricato con successo');
                    this.displayProgressBar = false;

                    if (this.element.uuid) {
                        // sto modificando quindi ho già l'uuid
                        this.navigateAfterUpdate();
                    } else {
                        // sto creando e l'endpoint di upload lancia un evento async, non conosce l'uuid dell'attachment creato
                        // riporto l'utente alla lista
                        this.navigateToList();
                    }
                },
                error => {
                    this.addError('Errore caricamento file,' + error);
                    this.displayProgressBar = false;
                }
            );
        } else {
            this.displayProgressBar = false;
        }
    }


}
