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


    private datoAsObservableOfValue(rowData: any, fieldDefinition: FieldDefinition): Observable<any> {
        const fieldName = fieldDefinition.name;
        if (!fieldName) {
            return of('');
        }

        const fullValue = rowData[fieldName];
        if (!fullValue) {
            return of('');
        }

        if (fieldDefinition.type === 'join') {
            const labelField = this.fieldDefintionService.fetchFirstLabel(fieldDefinition);
            return this.apiService.fetchObject(fieldDefinition.join_table_name, fullValue, fieldDefinition.join_table_select_fields)
                .pipe(
                    map(join => {
                        return join[labelField];
                    })
                );
        } else if (fieldDefinition.type === 'multijoin') {
            const labelField = this.fieldDefintionService.fetchFirstLabel(fieldDefinition);
            return this.apiService.fetchJoinList(this.metadataName, this.getTableKey(rowData),
                fieldDefinition.join_table_name,
                fieldDefinition.join_table_select_fields)
                .pipe(map(join => (join as unknown as Record<string, unknown>)[labelField as string]));
        } else {
            return of(fullValue);
        }

    }

    ngOnInit() {
        this.metadataName = this.route.snapshot.params['name'];
        this.metadataService.buildSearch();
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
                        for (const definition_1 of this.fieldDefinitionsList) {
                            if (!definition_1.name) {
                                continue;
                            }
                            definition_1.is_edit = true;
                            //cerco la field defintion
                            if (element.hasOwnProperty(definition_1.name) || element.hasOwnProperty(definition_1.name.toLowerCase())) {
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
        return String(fieldDefinition[this.metadata.table_key]);
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
