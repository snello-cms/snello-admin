import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import {EMPTY, Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {FieldDefinition} from '../models/field-definition';
import {ApiService} from '../services/api.service';
import {DataListService} from '../services/data-list.service';
import {Injectable} from '@angular/core';
import {MetadataService} from '../services/metadata.service';
import { requiredRouteParam } from '../common/route-params.util';

@Injectable({
    providedIn: 'root'
})
export class FieldDefinitionResolver  {
    constructor(private dataListService: DataListService,
                private metadataSerive: MetadataService,
                private router: Router,
                private apiService: ApiService,
                private messageService: MessageService) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FieldDefinition[]> | Observable<never> {
        const key = route.paramMap.get('uuid') ?? undefined;
        const name = requiredRouteParam(route, 'name');
        let fieldDefinitionList: any;
        return this.dataListService.getFieldDefinitionList(name).pipe(
            switchMap(
                el => {
                    fieldDefinitionList = el;
                    if (key) {
                        return this.apiService.fetchObject(name, key).pipe(
                            catchError(err => this.notOpened(name, key, err))
                        );
                    }
                    return of(null);
                }
            ),
            map(
                element => {
                    if (element != null) {
                        for (const definition_1 of fieldDefinitionList) {
                            definition_1.is_edit = true;
                            if (element.hasOwnProperty(definition_1.name) || element.hasOwnProperty(definition_1.name.toLowerCase())) {
                                definition_1.value = element[definition_1.name];
                            }
                            if (element.hasOwnProperty(definition_1.name.toLowerCase())) {
                                definition_1.value = element[definition_1.name.toLowerCase()];
                            }
                            definition_1.table_name = name;
                            definition_1.table_key_value = key;
                        }
                    }
                    for (const definition_1 of fieldDefinitionList) {
                        definition_1.mandatory = !!definition_1.mandatory;
                    }
                    fieldDefinitionList.sort((a: FieldDefinition, b: FieldDefinition) =>
                        (a.order_num ?? 0) - (b.order_num ?? 0)
                    );
                    return <FieldDefinition[]>fieldDefinitionList;
                }
            )
        );
    }

    /**
     * The record cannot be loaded (not the owner: 403, deleted or wrong link: 404): say so and show the table's list.
     * Without this the navigation was silently cancelled: the browser stayed on the previous page, the error only in
     * the console.
     */
    private notOpened(name: string, key: string, err: unknown): Observable<never> {
        const text = typeof err === 'string' ? err : String((err as {error?: unknown})?.error ?? err ?? '');
        const status = (err as {status?: number})?.status
            ?? (/\b403\b/.test(text) ? 403 : /\b404\b/.test(text) ? 404 : 0);
        const detail = status === 403 ? `You cannot open this ${name} record.`
            : status === 404 ? `This ${name} record does not exist (deleted, or a wrong link).`
                : `This ${name} record could not be loaded: ${text}`;
        console.warn('[resolver] record not opened', name, key, status || text);
        this.messageService.add({severity: 'error', summary: 'Not opened', detail, life: 8000});
        void this.router.navigate(['/datalist/list', name]);
        return EMPTY;
    }
}
