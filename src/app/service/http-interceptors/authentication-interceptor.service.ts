import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TOKEN_ITEM} from '../../../constants';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

    constructor() {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let headers: HttpHeaders = req.headers;

        if (!headers.get('Content-Type')) {
            headers = headers.set('Content-Type', 'application/json');
        }
        const token: string = localStorage.getItem(TOKEN_ITEM);

        if (token != null && token !== undefined) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return next.handle(req.clone({headers: headers}));
    }
}
