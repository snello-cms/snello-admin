import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {FieldDefinition} from '../model/field-definition';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class ApiService implements OnInit {

    url: string;
    _start: number;
    _limit: number;
    listSize: number;


    constructor(protected http: HttpClient, configurationService: ConfigurationService) {
        configurationService.getValue(API_SERVICE_PATH).subscribe(
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
                    console.log(keys);
                    const headers = keys.map(key => {
                            `${key}: ${res.headers.get(key)}`;
                        }
                    );
                    console.log(headers);
                    this.listSize = res.headers.get('size') != null ? +res.headers.get('size') : 0;
                    console.log(this.listSize);
                    const ts: any[] = res.body; // json();
                    return ts;
                }),
                catchError(this.handleError)
            );
    }

    private applyRestrictions(params: HttpParams, regConfigSearch?: FieldDefinition[]): any {

        for (const key of regConfigSearch) {
            if (key.value != null) {
                params = params.set(
                    key.search_field_name,
                    key.value
                );
            }

        }
        return params;
    }

    public getJoinList(field: FieldDefinition, searchValue?: string, search_field?: string): Observable<any[]> {
        let params = new HttpParams();
        // per ora senza ricerca e non paginate, in futuro chissà..
        params = params.set('select_fields', field.join_table_select_fields + ',' + field.join_table_key);

        if (searchValue) {
            params = params.set(
                search_field + '_contains',
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
                    const ts: any[] = res.body; // json();
                    return ts;
                }),
                catchError(this.handleError)
            );
    }

    protected toQueryParam(field: string, value: any) {
        if (value instanceof Date) {
            return (value as Date).toLocaleString('it-IT', {hour12: false});
        }
        return value;
    }


}
