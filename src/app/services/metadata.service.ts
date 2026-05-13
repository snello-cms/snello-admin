import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Metadata} from '../models/metadata';
import {Observable, of} from 'rxjs';
import {AbstractService} from '../common/abstract-service';
import {FieldDefinition} from '../models/field-definition';
import {catchError, map, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {EXPORT_API_PATH, IMPORT_API_PATH, METADATA_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class MetadataService extends AbstractService<Metadata> {

    private nameToMetadata: Map<string, Metadata> = new Map();
    private sidebarMetadataCache: Metadata[] | null = null;
    private sidebarMetadataRequest$: Observable<Metadata[]> | null = null;
    private exportUrl = '/api/metadatas/export';
    private importUrl = '/api/metadatas/import';

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(METADATA_API_PATH), http, messageService);

        configurationService.getValue(EXPORT_API_PATH).pipe(take(1)).subscribe(url => {
            if (url) {
                this.exportUrl = url;
            }
        });

        configurationService.getValue(IMPORT_API_PATH).pipe(take(1)).subscribe(url => {
            if (url) {
                this.importUrl = url;
            }
        });
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
            metadata_group: '',
            _limit: 10
        };
    }

    public getMetadataFromName(name: string): Metadata | undefined {
        return this.nameToMetadata.get(name);
    }

    public getSidebarMetadata(): Observable<Metadata[]> {
        if (this.sidebarMetadataCache) {
            return of(this.sidebarMetadataCache);
        }

        if (this.sidebarMetadataRequest$) {
            return this.sidebarMetadataRequest$;
        }

        this.sidebarMetadataRequest$ = this.getListSearch({}, 0, 0).pipe(
            tap((metadatas: Metadata[]) => {
                this.sidebarMetadataCache = metadatas;
            }),
            shareReplay(1)
        );

        return this.sidebarMetadataRequest$;
    }

    public clearSidebarMetadataCache(): void {
        this.sidebarMetadataCache = null;
        this.sidebarMetadataRequest$ = null;
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
            .post(this.exportUrl, {
                metadatas: metadataUuids
            })
            .pipe(catchError(this.handleError.bind(this)));
    }

    public importMetadatasFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        return this.httpClient
            .post(this.importUrl, formData)
            .pipe(catchError(this.handleError.bind(this)));
    }

    public getMetadataGroups(): Observable<string[]> {
        return this.urlValue.pipe(
            take(1),
            switchMap((url: string) => {
                this.url = url;
                return this.httpClient.get<string[]>(`${url}/groups`).pipe(
                    map((groups: string[] | null) => (groups ?? []).filter(group => !!group).map(group => group.trim()).filter(Boolean)),
                    catchError(() => of([]))
                );
            })
        );
    }
}
