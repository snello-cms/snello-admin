import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../models/field-definition';
import {ApiService} from '../../services/api.service';
import {DataListService} from '../../services/data-list.service';
import {MetadataService} from '../../services/metadata.service';
import {Metadata} from '../../models/metadata';
import {DynamicSearchFormComponent} from '../../generic.components/dynamic-form/dynamic-search-form.component';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {FieldDefinitionService} from '../../services/field-definition.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { AsyncPipe } from '@angular/common';

@Component({
    standalone: true,
    templateUrl: './form-generation-list.component.html',
    imports: [SideBarComponent, HomepageTopBar, DynamicSearchFormComponent, TableModule, PrimeTemplate, AsyncPipe]
})
export class FormGenerationListComponent implements OnInit {
    fieldDefinitionsList: FieldDefinition[] = [];
    fieldDefinitionsSearch: FieldDefinition[] = [];

    metadataName: string;
    model: any[] = [];
    firstReload: boolean;
    metadata: Metadata;

    @ViewChild(DynamicSearchFormComponent) searchForm: DynamicSearchFormComponent;

    constructor(
        protected router: Router,
        private route: ActivatedRoute,
        public apiService: ApiService,
        private dataListService: DataListService,
        private metadataService: MetadataService,
        private fieldDefintionService: FieldDefinitionService,
        private cdr: ChangeDetectorRef) {
    }

    private isPassivationSearchField(field: FieldDefinition): boolean {
        return field.type === 'checkbox' && field.input_type === 'passivation';
    }

    private applySearchDefaults() {
        for (const field of this.fieldDefinitionsSearch) {
            if (this.isPassivationSearchField(field)) {
                field.value = true;
                if (field.name && this.searchForm?.searchForm?.get(field.name)) {
                    this.searchForm.searchForm.get(field.name)?.setValue(true, {emitEvent: false});
                }
            }
        }
    }

    private readonly rawTableKeyField = '__rawTableKeyValue';

    private getElementPropertyName(element: Record<string, unknown>, fieldName: string): string | null {
        if (!element || !fieldName) {
            return null;
        }

        if (Object.prototype.hasOwnProperty.call(element, fieldName)) {
            return fieldName;
        }

        const lowerFieldName = fieldName.toLowerCase();
        const matchedKey = Object.keys(element).find(key => key.toLowerCase() === lowerFieldName);
        return matchedKey ?? null;
    }

    private getElementPropertyValue(element: Record<string, unknown>, fieldName: string): unknown {
        const propertyName = this.getElementPropertyName(element, fieldName);
        if (!propertyName) {
            return null;
        }
        return element[propertyName];
    }

    private getTableKeyFieldName(): string {
        const fromMetadata = this.metadata?.table_key;
        if (fromMetadata) {
            return fromMetadata;
        }

        const fromFieldDefinitions = this.fieldDefinitionsList.find(fd => fd.table_key === true)?.name;
        if (fromFieldDefinitions) {
            return fromFieldDefinitions;
        }

        return 'uuid';
    }

    private resolveTableKeyValue(rawValue: unknown): string {
        if (rawValue == null) {
            return '';
        }

        if (typeof rawValue !== 'object') {
            return String(rawValue);
        }

        const tableKeyFieldName = this.getTableKeyFieldName();
        const keyDefinition = this.fieldDefinitionsList.find(fd => fd.name === tableKeyFieldName);
        const candidate = rawValue as Record<string, unknown>;

        if (keyDefinition?.join_table_key && candidate[keyDefinition.join_table_key] != null) {
            return String(candidate[keyDefinition.join_table_key]);
        }
        if (candidate.uuid != null) {
            return String(candidate.uuid);
        }
        if (candidate.id != null) {
            return String(candidate.id);
        }

        if (candidate.value != null && typeof candidate.value !== 'object') {
            return String(candidate.value);
        }

        return '';
    }


    private datoAsObservableOfValue(rowData: any, fieldDefinition: FieldDefinition): Observable<any> {
        const fieldName = fieldDefinition.name;
        if (!fieldName) {
            return of('');
        }

        const fullValue = this.getElementPropertyValue(rowData as Record<string, unknown>, fieldName);
        if (fullValue == null || fullValue === '') {
            return of('');
        }

        if (fieldDefinition.type === 'join') {
            const labelField = this.fieldDefintionService.fetchFirstLabel(fieldDefinition);
            const fullValueObject = fullValue as Record<string, unknown>;
            const joinValue = typeof fullValue === 'object' && fullValue != null && fieldDefinition.join_table_key
                ? fullValueObject[fieldDefinition.join_table_key]
                : fullValue;

            if (joinValue == null || joinValue === '') {
                return of('');
            }

            return this.apiService.fetchObject(fieldDefinition.join_table_name, String(joinValue), fieldDefinition.join_table_select_fields)
                .pipe(
                    map(join => {
                        return join[labelField];
                    })
                );
        } else if (fieldDefinition.type === 'multijoin') {
            const labelField = this.fieldDefintionService.fetchFirstLabel(fieldDefinition);
            const ids = Array.isArray(fullValue)
                ? fullValue.map(value => String(value).trim()).filter(Boolean)
                : String(fullValue)
                    .split(',')
                    .map(value => value.trim())
                    .filter(Boolean);

            if (ids.length === 0) {
                return of('');
            }

            const selectFields = `${fieldDefinition.join_table_select_fields},${fieldDefinition.join_table_key}`;
            return this.apiService.fetchObjectsByKeys(
                fieldDefinition.join_table_name,
                fieldDefinition.join_table_key,
                ids,
                selectFields
            ).pipe(
                map(items => items
                    .map(item => item?.[labelField])
                    .filter(value => value != null && value !== '')
                    .join(', '))
            );
        } else {
            return of(fullValue);
        }

    }

    ngOnInit() {
        this.metadataName = this.route.snapshot.params['name'];
        this.metadataService.buildSearch();
        this.metadataService._start = 0;
        this.metadataService._limit = 10;
        this.metadataService.search.table_name = this.metadataName;
        this.metadataService.getList().subscribe(
            metadata => {
                if (metadata != null && metadata.length > 0) {
                    this.metadata = metadata[0];
                }
            }
        );


        this.route.data
            .subscribe(
                (data: unknown) => {
                    const resolved = (data as { fieldDefinitionValorized?: FieldDefinition[] })?.fieldDefinitionValorized;
                    this.fieldDefinitionsList = resolved ?? [];
                    for (const field of this.fieldDefinitionsList) {
                        if (field.searchable) {
                            this.fieldDefinitionsSearch.push(field);
                        }
                    }
                    this.applySearchDefaults();
                }
            );
    }

    public newForm() {
        if (this.fieldDefinitionsList) {
            this.router.navigate(['datalist/new', this.metadataName]);
        }

    }

    public edit(rowData: any) {
        this.router.navigate(['datalist/edit', this.metadataName, this.getTableKey(rowData)]);
    }

    public view(rowData: any) {
        this.router.navigate(['datalist/view', this.metadataName, this.getTableKey(rowData)]);
    }

    public clone(rowData: any) {
        this.router.navigate(['datalist/new', this.metadataName], {
            queryParams: {
                clone_uuid: this.getTableKey(rowData)
            }
        });
    }

    public loaddata(firstReload: boolean, datatable: any) {
        this.firstReload = firstReload;
        this.preLoaddata();
        const tableKeyFieldName = this.getTableKeyFieldName();

        // if (this.searchForm && this.searchForm.value) {
        //     const objToSearch = JSON.parse(JSON.stringify(this.searchForm.value));
        //     for (const k in objToSearch) {
        //         if (objToSearch.hasOwnProperty(k)) {
        //             for (const field of this.fieldDefinitionsSearch) {
        //                 if (field.name === k) {
        //                     field.value = objToSearch[field.name];
        //                 }
        //             }
        //         }
        //     }
        // }
        // valorizza valiri di ricerca con le fileddefinitions
        this.preSearch();

        this.apiService._limit = 10;
        this.apiService.getList(this.metadataName, this.fieldDefinitionsSearch).subscribe(
            model => {
                for (let element of model) {
                    if (element != null) {
                        element[this.rawTableKeyField] = this.getElementPropertyValue(element as Record<string, unknown>, tableKeyFieldName);

                        for (const definition_1 of this.fieldDefinitionsList) {
                            if (!definition_1.name) {
                                continue;
                            }
                            definition_1.is_edit = true;
                            const existingPropertyName = this.getElementPropertyName(element as Record<string, unknown>, definition_1.name);
                            //cerco la field defintion
                            if (existingPropertyName) {
                                // Se è la mia devo scrivere il dato come observable
                                element[definition_1.name] = this.datoAsObservableOfValue(element, definition_1);
                            }
                        }
                    }
                }
                this.model = model;
                this.cdr.detectChanges();
            }
        );
    }

    public preLoaddata() {
    }

    public lazyLoad(
        event: any, datatable?: any) {

        if (!this.firstReload) {
            this.apiService._start = event.first;
        } else {
            this.apiService._start = 0;
        }
        this.apiService._limit = event.rows;
        // this.service.search.pageSize = event.rows;
        this.loaddata(this.firstReload, datatable);
        if (this.firstReload) {
            this.firstReload = false;
        }
    }

    public getTableKey(fieldDefinition: any): string {
        const tableKeyFieldName = this.getTableKeyFieldName();
        const rawValue = fieldDefinition?.[this.rawTableKeyField]
            ?? this.getElementPropertyValue(fieldDefinition as Record<string, unknown>, tableKeyFieldName);
        return this.resolveTableKeyValue(rawValue);
    }

    public reload(datatable: any) {
        this.apiService._start = 0;
        datatable.reset();
        this.refresh(datatable);
    }

    public onSearchEnter(event: KeyboardEvent, datatable: any) {
        event.preventDefault();
        this.reload(datatable);
    }

    public refresh(datatable: any) {
        this.clearMsgs();
        datatable.reset();
    }

    public reset(datatable: any) {
        const obj: Record<string, unknown> = {};
        if (this.searchForm && this.searchForm.value) {
            for (const k in this.searchForm.value) {
                if (this.searchForm.value.hasOwnProperty(k)) {
                    obj[k] = null;
                }
            }
            for (const field of this.fieldDefinitionsSearch) {
                if (field.name && this.isPassivationSearchField(field)) {
                    obj[field.name] = true;
                    field.value = true;
                }
            }
            this.searchForm.searchForm.setValue(obj);
        }
        // this.apiService.buildSearch();
        this.refresh(datatable);
    }

    public clearMsgs() {
        // this.msgs = [];
    }

    // ribalta le proprieta dal form di ricerca in alto, sulla fieldDefinitionsSearch
    private preSearch() {
        if (this.searchForm && this.searchForm.value) {
            const objToSearch = JSON.parse(JSON.stringify(this.searchForm.value));
            for (const k in objToSearch) {
                if (objToSearch.hasOwnProperty(k)) {
                    for (const field of this.fieldDefinitionsSearch) {
                        if (field.name === k) {
                            if (this.isPassivationSearchField(field)) {
                                field.value = true;
                                continue;
                            }

                            const rawValue = objToSearch[field.name];
                            if (field.type === 'join' && field.join_table_key != null && rawValue != null && rawValue !== '') {
                                field.value = typeof rawValue === 'object'
                                    ? rawValue[field.join_table_key]
                                    : rawValue;
                                continue;
                            }

                            if (field.type === 'multijoin') {
                                if (Array.isArray(rawValue)) {
                                    const values = rawValue
                                        .map(value => typeof value === 'object' && value != null && field.join_table_key
                                            ? value[field.join_table_key]
                                            : value)
                                        .filter(value => value != null && value !== '');
                                    field.value = values.join(',');
                                } else {
                                    field.value = rawValue;
                                }
                                continue;
                            }

                            field.value = rawValue;
                        }
                    }
                }
            }
        }
    }
}
