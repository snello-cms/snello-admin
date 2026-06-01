import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, switchMap, take} from 'rxjs/operators';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {AuthUser} from '../models/auth-user';
import {ConfigurationService} from './configuration.service';
import {AUTH_API_PATH} from '../constants/constants';
import {Observable} from 'rxjs';
import {AuthGroup} from '../models/auth-group';

interface AuthUserRequest {
    username: string;
    email: string;
    name: string;
    surname: string;
    groupNames: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthUserService extends AbstractService<AuthUser> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(
            configurationService.getValue(AUTH_API_PATH).pipe(map(url => url + '/users')),
            http,
            messageService
        );
    }

    getId(element: AuthUser): string {
        return element.id;
    }

    buildSearch() {
        this.search = {
            _limit: 10
        };
    }

    override persist(element: AuthUser): Observable<AuthUser> {
        const body = this.toAuthUserRequest(element);
        return this.withUserUrl(url => this.httpClient
            .post<AuthUser>(url, body)
            .pipe(catchError(this.handleError.bind(this))));
    }

    override update(element: AuthUser): Observable<AuthUser> {
        const body = this.toAuthUserRequest(element);
        return this.withUserUrl(url => this.httpClient
            .put<AuthUser>(url + '/' + this.getId(element), body)
            .pipe(catchError(this.handleError.bind(this))));
    }

    userGroups(id: string): Observable<AuthGroup[]> {
        return this.withUserUrl(url => this.httpClient
            .get<AuthGroup[]>(url + '/' + id + '/groups')
            .pipe(catchError(this.handleError.bind(this))));
    }

    listGroups(): Observable<AuthGroup[]> {
        return this.withUserUrl(url => this.httpClient
            .get<AuthGroup[]>(url.replace(/\/users$/, '/groups'))
            .pipe(catchError(this.handleError.bind(this))));
    }

    private toAuthUserRequest(element: AuthUser): AuthUserRequest {
        return {
            username: element.username,
            email: element.email,
            name: element.name,
            surname: element.surname,
            groupNames: (element.groupNames || []).filter(groupName => !!groupName)
        };
    }

    private withUserUrl<R>(requestFactory: (url: string) => Observable<R>): Observable<R> {
        if (this.url) {
            return requestFactory(this.url);
        }
        return this.urlValue.pipe(
            take(1),
            switchMap(url => {
                this.url = url;
                return requestFactory(url);
            })
        );
    }
}
