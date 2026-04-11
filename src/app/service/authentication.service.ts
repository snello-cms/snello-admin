import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {
    CHANGEPASSWORD_API_PATH,
    LOGIN_API_PATH,
    REFRESH_TOKEN_ITEM,
    RESETPASSWORD_API_PATH,
    TOKEN_ITEM,
    USER_ITEM
} from '../constants/constants';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserInSession} from '../model/user-in-session';
import {ConfigurationService} from './configuration.service';
import {ChangePassword} from '../model/change-password';
import Keycloak, {KeycloakProfile, KeycloakTokenParsed} from 'keycloak-js';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    public utente: UserInSession;

    public userDetails: KeycloakProfile;
    public roles: string[];
    public decodedToken: any;
    public decodedRefreshToken: string;
    public extraroles: string[];
    public token: string;
    public expirationDate: any;
    public refreshToken: string;


    private access_token: any;
    private refresh_token: any;
    private logi_api_path: string;
    private resetpassword_api_path: string;
    private changepassword_api_path: string;

    constructor(private keycloak: Keycloak, private http: HttpClient, configurationService: ConfigurationService) {
        configurationService.getValue(LOGIN_API_PATH).subscribe(
            path => this.logi_api_path = path
        );
        configurationService.getValue(CHANGEPASSWORD_API_PATH).subscribe(
            change_path => this.changepassword_api_path = change_path
        );
        configurationService.getValue(RESETPASSWORD_API_PATH).subscribe(
            reset_path => this.resetpassword_api_path = reset_path
        );
        this.refreshKeycloak();
    }

    async refreshKeycloak() {
        if (this.keycloak.authenticated) {
            this.userDetails = await this.keycloak.loadUserProfile();
            this.roles = this.getUserRoles();
            this.token = this.keycloak.token ?? '';
            this.decodedToken = this.keycloak.tokenParsed;
            this.extraroles = ((this.decodedToken as { extraroles?: string[] } | undefined)?.extraroles) ?? [];
            this.refreshToken = this.keycloak.refreshToken ?? '';
        }
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


    public async logout() {
        await this.keycloak.logout();
    }

    public handleError(error: HttpErrorResponse): Observable<any> {
        return throwError(error || 'Server error');
    }

    private getUserRoles(): string[] {
        const parsed = this.keycloak.tokenParsed as KeycloakTokenParsed & {
            realm_access?: { roles?: string[] };
            resource_access?: Record<string, { roles?: string[] }>;
        };
        const realmRoles = parsed?.realm_access?.roles ?? [];
        const resourceRoles = Object.values(parsed?.resource_access ?? {})
            .flatMap(resource => resource.roles ?? []);
        return [...new Set([...realmRoles, ...resourceRoles])];
    }

}
