import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {from, Observable, throwError} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import Keycloak from 'keycloak-js';

@Injectable()
export class BasicHttpInterceptor implements HttpInterceptor {
  constructor(
      private keycloak: Keycloak
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.shouldSkipAuth(request.url)) {
      return next.handle(request);
    }

    const tokenAuth = this.keycloak.authenticated
      ? this.keycloak.updateToken(30).then(() => this.keycloak.token)
      : Promise.resolve(undefined);

    return from(tokenAuth).pipe(
        switchMap(token => {
          const clonedReq = this.addHeaders(request, token);
          return next.handle(clonedReq).pipe(
              map((event: HttpEvent<any>) => {
                return event;
              }),
              catchError((error: HttpErrorResponse) => {
                return throwError(error);
              })
          );
        })
    );
  }

  private addHeaders(
      request: HttpRequest<any>,
      token?: string
  ): HttpRequest<any> {
    let clone: HttpRequest<any>;
    let header: HttpHeaders = request.headers;
    const params: HttpParams = request.params;

    if (!!token) {
      header = header.set('Authorization', `Bearer ${token}`);
    }

    clone = request.clone({
      headers: header,
      responseType: request.responseType,
      params
    });
    return clone;
  }

  private shouldSkipAuth(url: string): boolean {
    return url.includes('/assets/') || url.startsWith('assets/');
  }
}
