import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {Role} from '../model/role';
import {ConfigurationService} from './configuration.service';
import {ROLE_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class RoleService extends AbstractService<Role> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(ROLE_API_PATH), http, messageService);
    }

    getId(element: Role) {
        return element.name;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            uuid: '',
            metadata_uuid: '',
            _limit: 10
        };
    }
}


