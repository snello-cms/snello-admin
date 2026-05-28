import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {ACTIONS_API_PATH} from '../constants/constants';
import {Action} from '../models/action';

@Injectable({
    providedIn: 'root'
})
export class ActionService extends AbstractService<Action> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(ACTIONS_API_PATH), http, messageService);
    }

    getId(element: Action) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            uuid: '',
            metadata_name_contains: '',
            condition: '',
            _limit: 10
        };
    }
}
