import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Document} from '../../model/document';
import {DocumentService} from '../../service/document.service';
import {ConfirmationService} from 'primeng/api';
import {BASE_PATH} from "../../constants/constants";

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
        public service: DocumentService) {

        super(router, confirmationService, service, 'document');
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

    webpath(name: string) {
        return BASE_PATH + name;
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
}
