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

  /**
   * Only the SPA's own static files (assets/config.json, i18n, icons) go without a token. The match is on the
   * app's assets/ folder resolved against <base href>, not on "/assets/" anywhere in the URL: that also matched
   * the API of a table named `assets` (PUT /api/assets/{id} went out without a token, 401 "Unauthorized").
   */
  private shouldSkipAuth(url: string): boolean {
    let skip = false;
    try {
      const target = new URL(url, document.baseURI).href;
      // under <base href>, and at the origin root: CONFIG_PATH is the absolute /assets/config.json
      skip = [new URL('assets/', document.baseURI).href, new URL('/assets/', document.baseURI).href]
        .some(folder => target.startsWith(folder));
    } catch (e) {
      console.warn('[auth] url not understood, sent with token', url, e);
    }
    if (skip) {
      console.debug('[auth] no token for static file', url);
    }
    return skip;
  }
}
