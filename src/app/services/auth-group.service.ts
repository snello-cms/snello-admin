import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map, switchMap, take} from 'rxjs/operators';
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
            name_contains: ''
        };
    }

    listAllGroups(): Observable<AuthGroup[]> {
        return this.withGroupsUrl(url => this.httpClient
            .get<AuthGroup[]>(url)
            .pipe(
                map(groups => {
                    const safeGroups = groups || [];
                    this.listSize = safeGroups.length;
                    return safeGroups;
                }),
                catchError(this.handleError.bind(this))
            ));
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

    private withGroupsUrl<R>(requestFactory: (url: string) => Observable<R>): Observable<R> {
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
