import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {LOGIN_API_PATH, TOKEN_ITEM, USER_ITEM} from '../constants/constants';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserInSession} from '../model/user-in-session';
import {ConfigurationService} from './configuration.service';

@Injectable()
export class AuthenticationService {

    public utente: UserInSession;
    private token: any;
    private logi_api_path: string;

    constructor(private http: HttpClient, configurationService: ConfigurationService) {
        this.logi_api_path = configurationService.get(LOGIN_API_PATH);
    }

    public getUtente(): Observable<UserInSession> {
        if (!this.utente) {
            const utenteString = localStorage.getItem(USER_ITEM);
            if (utenteString) {
                this.utente = JSON.parse(utenteString);
            }
        }
        return of(this.utente);
    }

    public login(username: string, password: string): Observable<boolean> {
        const body: HttpParams = new HttpParams().set('username', username).set('password', password);
        return this.http.post(this.logi_api_path, body, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
            .pipe(
                map((res: any) => {
                        const utente = new UserInSession();
                        utente.username = res.username;
                        utente.roles = res.roles;
                        this.token = res.token;
                        localStorage.setItem(TOKEN_ITEM, this.token);
                        localStorage.setItem(USER_ITEM, JSON.stringify(utente));
                    }
                ),
                switchMap(() => {
                    return this.getUtente()
                        .pipe(
                            map(() => {
                                return true;
                            }),
                            catchError(() => {
                                return of(false);
                            })
                        );
                }),
                catchError(this.handleError)
            );
    }

    public checkToken(): Observable<boolean> {
        const token: string = localStorage.getItem(TOKEN_ITEM);
        if (!token) {
            this.logout();
            return of(true);
        }
        this.token = token;

        return this.getUtente()
            .pipe(
                map(() => {
                    return true;
                })
            );
    }

    public checkLogged(): boolean {
        const token: string = localStorage.getItem(TOKEN_ITEM);
        if (!token) {
            return false;
        }
        return true;
    }

    public logout() {
        this.token = undefined;
        this.utente = undefined;
        localStorage.removeItem(TOKEN_ITEM);
    }

    public isLogged(): Observable<boolean> {
        if (this.utente) {
            return of(true);
        }
        return of(false);
    }


    public handleError(error: HttpErrorResponse): Observable<any> {
        return throwError(error || 'Server error');
    }

}
