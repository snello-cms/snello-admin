import {AbstractListComponent} from "../../common/abstract-list-component";
import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {Document} from "../../model/document";
import {DocumentService} from "../../service/document.service";

@Component(
    {
        templateUrl: "./document-list.component.html",
        styleUrls: ["./document-list.component.css"]
    }
)
export class DocumentListComponent extends AbstractListComponent<Document> {


    uuid: string;


    constructor(
        protected router: Router,
        protected service: DocumentService) {

        super(router, service, 'document');
        this.filters = new Document();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
        this.loaddata(true, null);
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    postList() {
        super.postList();
    }
}
