import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from "../common/abstract-service";
import {Document} from "../model/document";
import {DOCUMENT_API_PATH} from "../../constants";

@Injectable()
export class DocumentService extends AbstractService<Document> {

    constructor(protected http: HttpClient) {
        super(DOCUMENT_API_PATH, http);
    }

    getId(element: Document) {
        return element.uuid;
    }

    buildSearch() {
    }
}


