import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {from, Observable, throwError} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {KeycloakService} from 'keycloak-angular';

// @Injectable()
export class BasicHttpInterceptor implements HttpInterceptor {
  constructor(
      private authService: KeycloakService
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const tokenAuth = this.authService.getToken();

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
}
