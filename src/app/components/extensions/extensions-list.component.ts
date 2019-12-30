import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Extension} from "../../model/extension";
import {ExtensionService} from "../../service/extension.service";
import {DocumentService} from "../../service/document.service";

@Component(
    {
        templateUrl: './extensions-list.component.html'
    }
)
export class ExtensionsListComponent extends AbstractListComponent<Extension> implements OnInit {


    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: ExtensionService,
        public messageService: MessageService,
        public documentService: DocumentService) {
        super(messageService, router, confirmationService, service, 'extensions_admin');

    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
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
