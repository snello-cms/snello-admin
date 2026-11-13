import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';
import {IntrospectRequest} from '../models/introspect-request';
import {IntrospectResult} from '../models/introspect-result';

/**
 * Reverse schema authoring: existing DB tables → metadata + fielddefinitions (already_exist=true, never DDL).
 * URL derived from api_service_path, so config.json needs no new key.
 */
@Injectable({providedIn: 'root'})
export class IntrospectService {
    private readonly http = inject(HttpClient);
    private readonly configurationService = inject(ConfigurationService);

    preview(request: IntrospectRequest): Observable<IntrospectResult> {
        return this.post('preview', request);
    }

    /** apply answers 400 with the same IntrospectResult body when invalid: surface it as a normal result */
    apply(request: IntrospectRequest): Observable<IntrospectResult> {
        return this.post('apply', request);
    }

    private post(action: 'preview' | 'apply', request: IntrospectRequest): Observable<IntrospectResult> {
        console.info(`[introspect] ${action} tables=${request.tables?.join(',') || '(all)'} sample_rows=${request.sample_rows ?? '-'} group=${request.metadata_group ?? '-'}`);
        return this.configurationService.getConfiguration().pipe(
            take(1),
            map(config => String(config[API_SERVICE_PATH] ?? '') + '/introspect/' + action),
            switchMap(url => this.http.post<IntrospectResult>(url, request)),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 400 && error.error?.entities) {
                    return [error.error as IntrospectResult];
                }
                console.error(`[introspect] ${action} failed status=${error.status}`, error.error);
                return throwError(() => error);
            }),
            tap(result => console.info(`[introspect] ${action} valid=${result.valid} applied=${result.applied} entities=${result.entities?.length ?? 0} errors=${result.errors?.length ?? 0}`))
        );
    }
}
