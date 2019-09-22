import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {APPLICATION_JSON, AUTHORIZATION, BEARER_, CONTENT_TYPE, TOKEN_ITEM} from '../../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationInterceptor implements HttpInterceptor {
    constructor() {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let headers: HttpHeaders = req.headers;
        if (!headers.get(CONTENT_TYPE)) {
            headers = headers.set(CONTENT_TYPE, APPLICATION_JSON);
        }
        const token: string = sessionStorage.getItem(TOKEN_ITEM);
        if (token != null && token !== undefined) {
            headers = headers.set(AUTHORIZATION, BEARER_ + token);
        }
        return next.handle(req.clone({headers: headers}));
    }
}
