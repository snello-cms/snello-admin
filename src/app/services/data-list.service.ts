import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {catchError, map, take} from 'rxjs/operators';
import {Metadata} from '../models/metadata';
import {Observable, throwError} from 'rxjs';
import {FieldDefinition} from '../models/field-definition';
import {ConfigurationService} from './configuration.service';
import {DATA_LIST_API_PATH} from '../constants/constants';
import {toFieldDefinitions, toMetadata} from '../common/facet-model.util';

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
        return this.httpClient.get<unknown>(this.url + '/metadata/' + name, {
            observe: 'response',
        }).pipe(
            // API returns { identity, query, ui, ai, ... }: flatten to the Metadata shape the SPA uses
            map(res => toMetadata(res.body)),
            catchError(this.handleError)
        );
    }


    public getFieldDefinitionList(name: string): Observable<FieldDefinition[]> {
        const params = new HttpParams();

        return this.httpClient
            .get<unknown>(this.url + '/metadata/' + name + '/fielddefinitions', {
                observe: 'response',
                params: params,
            })
            .pipe(
                // API returns [{ ..., query, ui, ai }]: flatten so show_in_list / type / label are top-level again
                map(res => toFieldDefinitions(res.body)),
                catchError(this.handleError)
            );
    }

    protected handleError(error: HttpErrorResponse): Observable<any> {
        return throwError(() => error.message || 'Server error');
    }

}


