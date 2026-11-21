import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';
import {IntrospectRequest} from '../models/introspect-request';
import {IntrospectResult} from '../models/introspect-result';

export interface IntrospectTableEntry {
    name: string;
    referenced: boolean;
}

export interface IntrospectCatalog {
    total: number;
    available: number;
    already_referenced: number;
    tables: IntrospectTableEntry[];
}

export interface IntrospectJob {
    uuid: string;
    status: string;
    created_at: string;
    started_at?: string;
    finished_at?: string;
    created_by?: string;
    metadata_group?: string;
    sample_rows: number;
    total_tables: number;
    done_tables: number;
    failed_tables: number;
    current_table?: string;
    error_message?: string;
}

export interface IntrospectJobLog {
    uuid: string;
    job_uuid: string;
    created_at: string;
    level: string;
    table_name?: string;
    message: string;
}

/**
 * Reverse schema authoring: existing DB tables → metadata + fielddefinitions (already_exist=true, never DDL).
 * URL derived from api_service_path, so config.json needs no new key.
 */
@Injectable({providedIn: 'root'})
export class IntrospectService {
    private readonly http = inject(HttpClient);
    private readonly configurationService = inject(ConfigurationService);

    catalog(q?: string): Observable<IntrospectCatalog> {
        return this.baseUrl().pipe(
            switchMap(base => {
                let params = new HttpParams();
                if (q) {
                    params = params.set('q', q);
                }
                return this.http.get<IntrospectCatalog>(`${base}/tables`, {params});
            })
        );
    }

    preview(request: IntrospectRequest): Observable<IntrospectResult> {
        return this.post('preview', request);
    }

    /** apply answers 400 with the same IntrospectResult body when invalid: surface it as a normal result */
    apply(request: IntrospectRequest): Observable<IntrospectResult> {
        return this.post('apply', request);
    }

    startBatch(sampleRows = 5, metadataGroup?: string): Observable<IntrospectJob> {
        return this.baseUrl().pipe(
            switchMap(base => this.http.post<IntrospectJob>(`${base}/batch`, {
                sample_rows: sampleRows,
                metadata_group: metadataGroup || null
            }))
        );
    }

    listJobs(): Observable<IntrospectJob[]> {
        return this.baseUrl().pipe(switchMap(base => this.http.get<IntrospectJob[]>(`${base}/batch`)));
    }

    getJob(uuid: string): Observable<IntrospectJob> {
        return this.baseUrl().pipe(switchMap(base => this.http.get<IntrospectJob>(`${base}/batch/${uuid}`)));
    }

    getLogs(uuid: string, after?: string): Observable<IntrospectJobLog[]> {
        return this.baseUrl().pipe(
            switchMap(base => {
                let params = new HttpParams();
                if (after) {
                    params = params.set('after', after);
                }
                return this.http.get<IntrospectJobLog[]>(`${base}/batch/${uuid}/logs`, {params});
            })
        );
    }

    cancel(uuid: string): Observable<IntrospectJob> {
        return this.baseUrl().pipe(
            switchMap(base => this.http.post<IntrospectJob>(`${base}/batch/${uuid}/cancel`, {}))
        );
    }

    private post(action: 'preview' | 'apply', request: IntrospectRequest): Observable<IntrospectResult> {
        console.info(`[introspect] ${action} tables=${request.tables?.join(',') || '(all)'} sample_rows=${request.sample_rows ?? '-'} group=${request.metadata_group ?? '-'}`);
        return this.baseUrl().pipe(
            map(base => `${base}/${action}`),
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

    private baseUrl(): Observable<string> {
        return this.configurationService.getConfiguration().pipe(
            take(1),
            map(config => String(config[API_SERVICE_PATH] ?? '').replace(/\/$/, '') + '/introspect')
        );
    }
}
