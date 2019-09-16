import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {UserRole} from '../model/user-role';
import {catchError} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {USER_ROLES_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class UserRoleService extends AbstractService<UserRole> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(USER_ROLES_API_PATH), http, messageService);
    }

    getId(element: UserRole) {
        return element.username;
    }

    buildSearch() {
        this.search = {
            username: '',
            role: '',
            _limit: 10
        };
    }

    deleteForUsername(username: string) {
        return this.httpClient
            .delete(this.url + '/' + username, {responseType: 'text'})
            .pipe(catchError(this.handleError.bind(this)));
    }
}


