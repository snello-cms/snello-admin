import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map, take} from 'rxjs/operators';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {AuthGroup} from '../models/auth-group';
import {AuthUser} from '../models/auth-user';
import {ConfigurationService} from './configuration.service';
import {AUTH_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthGroupService extends AbstractService<AuthGroup> {

    private baseAuthUrl = '';

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(
            configurationService.getValue(AUTH_API_PATH).pipe(map(url => url + '/groups')),
            http,
            messageService
        );
        configurationService.getValue(AUTH_API_PATH).pipe(take(1)).subscribe(url => this.baseAuthUrl = url);
    }

    getId(element: AuthGroup): string {
        return element.id;
    }

    buildSearch() {
        this.search = {
            _limit: 10
        };
    }

    verifyGroups(): Observable<any> {
        const createUrl = (this.baseAuthUrl || this.url.replace(/\/groups$/, '')) + '/createGroups';
        return this.httpClient
            .post<any>(createUrl, null)
            .pipe(catchError(this.handleError.bind(this)));
    }

    groupUsers(id: string): Observable<AuthUser[]> {
        const usersUrl = (this.baseAuthUrl || this.url.replace(/\/groups$/, '')) + '/groups/' + id + '/users';
        return this.httpClient
            .get<AuthUser[]>(usersUrl)
            .pipe(catchError(this.handleError.bind(this)));
    }

    override persist(element: AuthGroup): Observable<AuthGroup> {
        const createUrl = (this.baseAuthUrl || this.url.replace(/\/groups$/, '')) + '/createGroups';
        const body = this.marshall(element);
        return this.httpClient
            .post<AuthGroup>(createUrl, body)
            .pipe(catchError(this.handleError.bind(this)));
    }
}
