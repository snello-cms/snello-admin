import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {IDENTITY_API_PATH, LOGIN_API_PATH, TOKEN_ITEM, USER_ITEM} from "../../constants";
import {User} from "../model/user";
import {catchError, map, switchMap} from "rxjs/operators";
import {UserInSession} from "../model/user-in-session";

@Injectable()
export class AuthenticationService {

  public utente: UserInSession;

  private token: any;

  constructor(private http: HttpClient) {
  }

  public getUtente(): Observable<UserInSession> {
    if (!this.utente) {
      let utenteString = localStorage.getItem(USER_ITEM);
      if (utenteString) {
        this.utente = JSON.parse(utenteString);
      }
    }
    return of(this.utente);
  }

  public login(username: string, password: string): Observable<boolean> {
    let body: HttpParams = new HttpParams().set("username", username).set("password", password);
    return this.http.post(LOGIN_API_PATH, body, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
      .pipe(
        map((res: any) => {
            let utente = new UserInSession();
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
