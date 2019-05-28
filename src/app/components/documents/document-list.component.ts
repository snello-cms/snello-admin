import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Document} from '../../model/document';
import {DocumentService} from '../../service/document.service';
import {ConfirmationService} from 'primeng/api';
import {BASE_PATH} from "../../../constants";

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
}
