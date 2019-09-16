import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {SelectQuery} from '../model/select-query';
import {ConfigurationService} from './configuration.service';
import {SELECT_QUERY_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class SelectQueryService extends AbstractService<SelectQuery> {
    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(SELECT_QUERY_API_PATH), http, messageService);
    }

    getId(element: SelectQuery) {
        return element.uuid;
    }


    buildSearch() {
        this.search = {
            uuid: '',
            _limit: 10
        };
    }


}
