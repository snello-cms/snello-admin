import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {Link} from '../model/link';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {LINKS_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class LinksService extends AbstractService<Link> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(LINKS_API_PATH), http, messageService);
    }

    getId(element: Link) {
        return element.name;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            uuid: '',
            _limit: 10
        };
    }

    create(link: Link): Observable<any> {
        const body = this.marshall(link);
        return this.httpClient
            .get<any>(this.url + '/' + link.name + '/create')
            .pipe(catchError(this.handleError.bind(this)));
    }
}


