import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {FONT_AWESOME_ICONS} from '../../constants/constants';
import {Extension} from '../../model/extension';
import {ExtensionService} from '../../service/extension.service';
import {DocumentService} from '../../service/document.service';
import {flatMap} from 'rxjs/operators';
import {from, Observable, of} from 'rxjs';

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

    iconItems: SelectItem[] = FONT_AWESOME_ICONS;

    files: any[] = [];
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
        this.uploading = true;
        this.processed = false;
        this.okFileList = [];
        this.errorFileList = [];
        this.files = event.files;
    }


    public save() {
        this.service.persist(this.element).pipe(
            flatMap(
                extensionSaved => {
                    console.log('extension seaved', extensionSaved);
                    this.element = extensionSaved;
                    return from(this.uploadAFile(this.files[0], extensionSaved.uuid));
                }
            ),
            flatMap(
                documentUploaded => {
                    console.log('document uploaded', documentUploaded);
                    this.element.library_path = documentUploaded.uuid;
                    return this.service.update(this.element);
                    this.router.navigate(['/' + this.path + '/list']);
                }
            )
        ).subscribe(
            extension => {
                console.log('saved extension ', extension);
            },
            error => {
                this.addError(error);
            }
        );
    }


    public update() {

        let obs: Observable<any> = of(null);
        if (this.files.length >= 1) {
            obs = from(this.uploadAFile(this.files[0], this.element.uuid));
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
                this.router.navigate(['/' + this.path + '/list']);
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
            })
            .catch(error => {
                this.errorFileList = [this.uploadedFile, ...this.errorFileList];
                this.uploading = false;
            });
    }

    onBasicUpload($event: any) {
        console.log($event);
    }

}
