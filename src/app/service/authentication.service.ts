import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {CHANGEPASSWORD_API_PATH, LOGIN_API_PATH, REFRESH_TOKEN_ITEM, TOKEN_ITEM, USER_ITEM} from '../constants/constants';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserInSession} from '../model/user-in-session';
import {ConfigurationService} from './configuration.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    public utente: UserInSession;
    private access_token: any;
    private refresh_token: any;
    private logi_api_path: string;
    private changepassword_api_path: string;

    constructor(private http: HttpClient, configurationService: ConfigurationService) {
        configurationService.getValue(LOGIN_API_PATH).subscribe(
            path => this.logi_api_path = path
        );
        configurationService.getValue(CHANGEPASSWORD_API_PATH).subscribe(
            reset_path => this.changepassword_api_path = reset_path
        );
    }

    public getUtente(): Observable<UserInSession> {
        if (!this.utente) {
            const utenteString = sessionStorage.getItem(USER_ITEM);
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
                        this.access_token = res.access_token;
                        this.refresh_token = res.refresh_token;
                        sessionStorage.setItem(TOKEN_ITEM, this.access_token);
                        sessionStorage.setItem(REFRESH_TOKEN_ITEM, this.refresh_token);
                        sessionStorage.setItem(USER_ITEM, JSON.stringify(utente));
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

    changepassword(username: string): Observable<any> {
        const body: HttpParams = new HttpParams();
        return this.http.post(this.changepassword_api_path, body);
    }

    public checkToken(): Observable<boolean> {
        const token: string = sessionStorage.getItem(TOKEN_ITEM);
        if (!token) {
            this.logout();
            return of(false);
        }
        this.access_token = token;
        return this.getUtente()
            .pipe(
                map(() => {
                    return true;
                })
            );
    }

    public checkLogged(): boolean {
        const token: string = sessionStorage.getItem(TOKEN_ITEM);
        if (!token) {
            return false;
        }
        return true;
    }

    public logout() {
        this.access_token = undefined;
        this.refresh_token = undefined;
        this.utente = undefined;
        sessionStorage.removeItem(TOKEN_ITEM);
        sessionStorage.removeItem(REFRESH_TOKEN_ITEM);
        sessionStorage.removeItem(USER_ITEM);
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
