import {Injectable, OnInit} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, take} from 'rxjs/operators';
import {FieldDefinition} from '../models/field-definition';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class ApiService implements OnInit {

    url = '';
    _start = 0;
    _limit = 10;
    listSize = 0;


    constructor(protected http: HttpClient, configurationService: ConfigurationService) {
        configurationService.getValue(API_SERVICE_PATH).pipe(take(1)).subscribe(
            url => this.url = url
        );
    }

    ngOnInit(): void {
    }


    public handleError(error: HttpErrorResponse): Observable<any> {
        if (error.status === 401) {
            return throwError({status: error.status, error: 'Unauthorized'});
        } else if (error.status === 500) {
            return throwError({status: error.status, error: error.message || error.error});
        }
        return throwError(error.message /*json().msg*/ || error.error /*json().error*/ || 'Server error');
    }


    public persist(tableName: string, element: any): Observable<any> {
        const url = this.url + '/' + tableName;
        const body = element;
        return this.http
            .post<any>(url, body)
            .pipe(catchError(this.handleError));
    }

    public delete(tableName: string, table_key: string): Observable<any> {
        const url = this.url + '/' + tableName + '/' + table_key;
        return this.http
            .delete(url, {responseType: 'text'})
            .pipe(catchError(this.handleError.bind(this)));
    }

    public update(tableName: string, table_key: string, element: any): Observable<any> {
        const url = this.url + '/' + tableName + '/' + table_key;
        const body = element;
        return this.http
            .put<any>(url, body)
            .pipe(catchError(this.handleError));
    }

    public fetchObject(tableName: string, table_key: string, select_fields?: string): Observable<any> {
        let params = new HttpParams();
        if (select_fields && select_fields.length > 0) {
            params = params.set('select_fields', select_fields);
        }
        const url = this.url + '/' + tableName + '/' + table_key;
        return this.http.get(url, {
            observe: 'response',
            params: params,
        }).pipe(
            map(res => {
                const t: any = <any>res.body; // json();
                return t;
            }),
            catchError(this.handleError)
        );
    }

    public fetchObjectsByKeys(tableName: string, keyField: string, keys: string[], selectFields?: string): Observable<any[]> {
        const normalizedKeys = keys
            .map(key => key?.trim())
            .filter((key): key is string => Boolean(key));

        if (normalizedKeys.length === 0) {
            return new Observable<any[]>(subscriber => {
                subscriber.next([]);
                subscriber.complete();
            });
        }

        let params = new HttpParams();
        params = params.set('_start', '0');
        params = params.set('_limit', '0');
        if (selectFields && selectFields.length > 0) {
            params = params.set('select_fields', selectFields);
        }
        params = params.set(`${keyField}_in`, normalizedKeys.join(','));

        return this.http.get<any[]>(`${this.url}/${tableName}`, {
            observe: 'response',
            params
        }).pipe(
            map(res => {
                const items = res.body ?? [];
                const keyedItems = new Map<string, any>();
                for (const item of items) {
                    const keyValue = item?.[keyField];
                    if (keyValue != null) {
                        keyedItems.set(String(keyValue), item);
                    }
                }
                return normalizedKeys
                    .map(key => keyedItems.get(key))
                    .filter(item => item != null);
            }),
            catchError(this.handleError)
        );
    }

    public fetchJoinList(metadata_from_name: string, metadata_uuid: string, metadata_to_name: string,
                         select_fields?: string): Observable<any[]> {
        let params = new HttpParams();
        // per ora senza ricerca e non paginate, in futuro chissà..
        if (select_fields && select_fields.length > 0) {
            params = params.set('select_fields', select_fields);
        }
        const url = this.url + '/' + metadata_from_name + '/' + metadata_uuid + '/' + metadata_to_name;
        return this.http.get(url, {
            observe: 'response',
            params: params,
        }).pipe(
            map(res => {
                const t: any = <any>res.body; // json();
                return t;
            }),
            catchError(this.handleError)
        );
    }


    public getList(tableName: string, regConfigSearch: FieldDefinition[]) {
        let params = new HttpParams();
        params = params.set('_start', this._start + '');
        params = params.set('_limit', this._limit + '');
        params = this.applyRestrictions(params, regConfigSearch);
        return this.http
            .get<any[]>(this.url + '/' + tableName, {
                observe: 'response',
                params: params,
            })
            .pipe(
                map(res => {
                    const keys = res.headers.keys();
                    const headers = keys.map(key => {
                            `${key}: ${res.headers.get(key)}`;
                        }
                    );
                    const sizeHeader = res.headers.get('size');
                    this.listSize = sizeHeader != null ? +sizeHeader : 0;
                    const ts: any[] = res.body ?? []; // json();
                    return ts;
                }),
                catchError(this.handleError)
            );
    }

    private applyRestrictions(params: HttpParams, regConfigSearch?: FieldDefinition[]): HttpParams {

        if (!regConfigSearch) {
            return params;
        }

        for (const key of regConfigSearch) {
            if (key.value != null) {
                params = params.set(
                    key.search_field_name,
                    this.toQueryParam(key)
                );
            }

        }
        return params;
    }

    public getJoinList(field: FieldDefinition, searchValue?: string, search_field?: string): Observable<any[]> {
        let params = new HttpParams();
        // per ora senza ricerca e non paginate, in futuro chissà..
        params = params.set('select_fields', field.join_table_select_fields + ',' + field.join_table_key);
        params = params.set('_limit', '0');
        params = params.set('_start', '0');

        if (searchValue) {
            params = params.set(
                search_field + '_containss',
                searchValue
            );
        }
        return this.http
            .get<any[]>(this.url + '/' + field.join_table_name, {
                observe: 'response',
                params: params,
            })
            .pipe(
                map(res => {
                    const keys = res.headers.keys();
                    // console.log(keys);
                    const headers = keys.map(key => {
                            `${key}: ${res.headers.get(key)}`;
                        }
                    );
                    // console.log(headers);
                    const ts: any[] = res.body ?? []; // json();
                    return ts;
                }),
                catchError(this.handleError)
            );
    }

    private pad(value: number): string {
        return value.toString().padStart(2, '0');
    }

    private formatLocalDate(value: Date): string {
        return `${value.getFullYear()}-${this.pad(value.getMonth() + 1)}-${this.pad(value.getDate())}`;
    }

    private formatLocalTime(value: Date): string {
        return `${this.pad(value.getHours())}:${this.pad(value.getMinutes())}:${this.pad(value.getSeconds())}`;
    }

    private formatLocalDateTime(value: Date): string {
        const timezoneOffsetMinutes = -value.getTimezoneOffset();
        const sign = timezoneOffsetMinutes >= 0 ? '+' : '-';
        const absoluteOffsetMinutes = Math.abs(timezoneOffsetMinutes);
        const offsetHours = this.pad(Math.floor(absoluteOffsetMinutes / 60));
        const offsetMinutes = this.pad(absoluteOffsetMinutes % 60);

        return `${this.formatLocalDate(value)}T${this.formatLocalTime(value)}${sign}${offsetHours}:${offsetMinutes}`;
    }

    protected toQueryParam(field: FieldDefinition): string {
        const value = field.value;
        if (value instanceof Date) {
            if (field.type === 'date') {
                return this.formatLocalDate(value);
            }
            if (field.type === 'datetime') {
                return this.formatLocalDateTime(value);
            }
            if (field.type === 'time') {
                return this.formatLocalTime(value);
            }
            return this.formatLocalDateTime(value);
        }
        return String(value);
    }


}
