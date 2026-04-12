import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {catchError, map, take} from 'rxjs/operators';
import {Metadata} from '../models/metadata';
import {Observable, throwError} from 'rxjs';
import {FieldDefinition} from '../models/field-definition';
import {ConfigurationService} from './configuration.service';
import {DATA_LIST_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class DataListService {

    url = '';

    constructor(protected httpClient: HttpClient, configurationService: ConfigurationService) {
         configurationService.getValue(DATA_LIST_API_PATH).pipe(take(1)).subscribe(
           url => this.url = url
       );
    }

    public getMetadataNames() {
        const params = new HttpParams();

        return this.httpClient
            .get<string[]>(this.url + '/names', {
                observe: 'response',
                params: params,
            })
            .pipe(
                map(res => {
                    const ts: string[] = res.body ?? []; // json();
                    return ts;
                }),
                catchError(this.handleError)
            );
    }


    public findMetdata(name: string) {
        return this.httpClient.get<Metadata>(this.url + '/metadata/' + name, {
            observe: 'response',
        }).pipe(
            map(res => {
                const t: Metadata | null = res.body; // json();
                return t;
            }),
            catchError(this.handleError)
        );
    }


    public getFieldDefinitionList(name: string): Observable<FieldDefinition[]> {
        const params = new HttpParams();

        return this.httpClient
            .get<FieldDefinition[]>(this.url + '/metadata/' + name + '/fielddefinitions', {
                observe: 'response',
                params: params,
            })
            .pipe(
                map(res => {
                    const ts: FieldDefinition[] = res.body ?? []; // json();
                    return ts;
                }),
                catchError(this.handleError)
            );
    }

    protected handleError(error: HttpErrorResponse): Observable<any> {
        return throwError(() => error.message || 'Server error');
    }

}


