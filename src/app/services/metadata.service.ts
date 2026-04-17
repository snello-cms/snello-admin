import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Metadata} from '../models/metadata';
import {Observable, of} from 'rxjs';
import {AbstractService} from '../common/abstract-service';
import {FieldDefinition} from '../models/field-definition';
import {catchError, map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {METADATA_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class MetadataService extends AbstractService<Metadata> {

    private nameToMetadata: Map<string, Metadata> = new Map();
    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(METADATA_API_PATH), http, messageService);
    }

    getId(element: Metadata): string {
        return element.uuid;
    }

    generateFieldDefinition(
        arrayFromServer: FieldDefinition[],
        valuesMap: Map<string, any>,
        visualization: string
    ): FieldDefinition[] {
        void visualization;
        let i;
        for (i = 0; i < arrayFromServer.length; i++) {
            const fieldName = arrayFromServer[i].name;
            if (!fieldName) {
                continue;
            }
            arrayFromServer[i].value = valuesMap.get(fieldName);
        }
        return arrayFromServer;
    }

    viewMetadata(name: string, id: string): Observable<FieldDefinition[]> {
        void name;
        void id;
        return of([]);
    }

    newMetadata(name: string): Observable<FieldDefinition[]> {
        void name;
        return of([]);
    }

    buildSearch() {
        this.search = {
            table_name_contains: '',
            uuid: '',
            _limit: 10
        };
    }

    public getMetadataFromName(name: string): Metadata | undefined {
        return this.nameToMetadata.get(name);
    }

    protected postList(ts: Metadata[]) {
        for (const metadata of ts) {
            this.nameToMetadata.set(metadata.table_name, metadata);
        }
        super.postList(ts);
    }

    public createTable(metadata: Metadata) {
        return this.httpClient
            .get(this.url + '/' + metadata.uuid + '/create', {
                observe: 'response'
            })
            .pipe(
                map(res => {
                    const t: any = <any>res.body; // json();
                    return t;
                }),
                catchError(this.handleError)
            );
    }

    public deleteTable(uuid: string) {
        return this.httpClient
            .get(this.url + '/' + uuid + '/delete', {
                observe: 'response'
            })
            .pipe(
                map(res => {
                    const t: any = <any>res.body; // json();
                    return t;
                }),
                catchError(this.handleError)
            );
    }

    public truncateTable(uuid: string) {
        return this.httpClient
            .get(this.url + '/' + uuid + '/truncate', {
                observe: 'response'
            })
            .pipe(
                map(res => {
                    const t: any = <any>res.body; // json();
                    return t;
                }),
                catchError(this.handleError)
            );
    }

    public exportMetadatas(metadataUuids: string[]): Observable<any> {
        return this.httpClient
            .post('/api/metadatas/export', {
                metadatas: metadataUuids
            })
            .pipe(catchError(this.handleError.bind(this)));
    }

    public importMetadatas(payload: any): Observable<any> {
        return this.httpClient
            .post('/api/metadatas/import', payload)
            .pipe(catchError(this.handleError.bind(this)));
    }
}
