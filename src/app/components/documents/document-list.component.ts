import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Document} from '../../model/document';
import {DocumentService} from '../../service/document.service';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component(
    {
        templateUrl: './document-list.component.html',
        styleUrls: ['./document-list.component.css']
    }
)
export class DocumentListComponent extends AbstractListComponent<Document> implements OnInit {


    uuid: string;


    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: DocumentService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'document');
        this.filters = new Document();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    postList() {
        super.postList();
    }

    download(uuid: string): void {
        this.service.simplDownload(uuid).subscribe(response => {

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

    downloadPath(uuid: string) {
        return this.service.downloadPath(uuid);
    }

    public notify(info: string) {
        const dwl =
            // Might want to notify the user that something has been pushed to the clipboard
            this.messageService.add({
                severity: 'info',
                summary: `'${info}' has been copied to clipboard`
            });
    }

    delete(element: Document) {
        this.clearMsgs();
        this.service.delete(element.uuid).subscribe(
            result => {
                this.addInfo('Eliminazione completata con successo. ');
                this.loaddata(false, null);
            },
            error => {
                this.addError('Impossibile completare la eliminazione. ');
            }
        );
    }
}
