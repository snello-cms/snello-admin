import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {FONT_AWESOME_ICONS} from '../../constants/constants';
import {Extension} from '../../model/extension';
import {ExtensionService} from '../../service/extension.service';
import {DocumentService} from '../../service/document.service';
import {flatMap} from 'rxjs/operators';
import {from, Observable, of} from 'rxjs';
import {FileUpload} from "primeng/fileupload";

@Component({
    templateUrl: './extensions-edit.component.html'
})
export class ExtensionsEditComponent extends AbstractEditComponent<Extension> implements OnInit {

    constructor(
        router: Router,
        route: ActivatedRoute,
        confirmationService: ConfirmationService,
        extensionService: ExtensionService,
        private documentService: DocumentService,
        public messageService: MessageService,
    ) {
        super(router, route, confirmationService, extensionService, messageService, 'extensions_admin');
    }

    @ViewChild('fup', {static: false})
    fup: FileUpload;

    iconItems: SelectItem[] = FONT_AWESOME_ICONS;

    uploadedFiles: any[] = [];
    public uploading = false;
    public uploadedFile: string;
    public progress: number;
    public processed = false;
    public okFileList: string[];
    public errorFileList: string[];


    createInstance(): Extension {
        return new Extension();
    }


    ngOnInit() {
        this.element = new Extension();
        super.ngOnInit();
    }

    public uploader(event) {
        this.processed = false;
        this.okFileList = [];
        this.errorFileList = [];
        this.uploadedFiles = event.files;
    }


    public save() {
        this.uploading = true;
        this.service.persist(this.element).pipe(
            flatMap(
                extensionSaved => {

                    console.log('extension seaved', extensionSaved);
                    this.element = extensionSaved;
                    return from(this.uploadAFile(this.uploadedFiles[0], extensionSaved.uuid));
                }
            ),
            flatMap(
                documentUploaded => {
                    console.log('document uploaded', documentUploaded);
                    this.element.library_path = documentUploaded.uuid;
                    return this.service.update(this.element);
                }
            )
        ).subscribe(
            extension => {
                console.log('saved extension ', extension);
                this.uploading = false;
                this.navigateAfterSave();
            },
            error => {
                this.uploading = false;
                this.addError(error);
            }
        );
    }


    public update() {

        let obs: Observable<any> = of(null);
        if (this.uploadedFiles.length >= 1) {
            obs = from(this.uploadAFile(this.uploadedFiles[0], this.element.uuid));
        } else {
            console.log('no files');
        }

        return obs.pipe(
            flatMap(
                documentUploaded => {
                    if (documentUploaded) {
                        console.log('document uploaded', documentUploaded);
                        this.element.library_path = documentUploaded.uuid;
                    }
                    return this.service.update(this.element);
                }
            )
        ).subscribe(
            extension => {
                console.log('saved extension ', extension);
                this.navigateAfterUpdate();
            },
            error => {
                this.addError(error);
            }
        );
    }


    private uploadAFile(file, extension_uuid: string): Promise<any> {
        this.uploadedFile = file.name;
        return this.documentService
            .upload(file, 'extension', extension_uuid)
            .then(res => {
                this.okFileList = [this.uploadedFile, ...this.okFileList];
                this.uploading = false;
                return res;
            })
            .catch(error => {
                this.errorFileList = [this.uploadedFile, ...this.errorFileList];
                this.uploading = false;
            });
    }

    download(uuid: string): void {
        this.documentService.simplDownload(uuid).subscribe(response => {

            // It is necessary to create a new blob object with mime-type explicitly set
            // otherwise only Chrome works like it should
            const newBlob = new Blob([(response)], {type: 'application/octet-stream'});

            // IE doesn't allow using a blob object directly as link href
            // instead it is necessary to use msSaveOrOpenBlob
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(newBlob);
                return;
            }

            // For other browsers:
            // Create a link pointing to the ObjectURL containing the blob.
            const downloadURL = URL.createObjectURL(response);
            window.open(downloadURL);
        });
    }

    public notify(info: string) {
        const dwl =
            // Might want to notify the user that something has been pushed to the clipboard
            this.messageService.add({
                severity: 'info',
                summary: `'${info}' has been copied to clipboard`
            });
    }

}
