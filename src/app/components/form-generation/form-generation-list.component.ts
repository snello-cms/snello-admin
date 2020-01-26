import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from '../../service/api.service';
import {DataListService} from '../../service/data-list.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';
import {DynamicSearchFormComponent} from '../../generic.components/dynamic-form/dynamic-search-form.component';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {FieldDefinitionService} from '../../service/field-definition.service';

@Component(
    {
        templateUrl: './form-generation-list.component.html',
        styleUrls: ['./form-generation-list.component.css']
    }
)
export class FormGenerationListComponent implements OnInit {
    regConfigList: FieldDefinition[] = [];
    regConfigSearch: FieldDefinition[] = [];

    metadataName: string;
    model: any[] = [];
    firstReload: boolean;
    metadata: Metadata;

    @ViewChild(DynamicSearchFormComponent, {static: false}) searchForm: DynamicSearchFormComponent;

    constructor(
        protected router: Router,
        private route: ActivatedRoute,
        public apiService: ApiService,
        private dataListService: DataListService,
        private metadataService: MetadataService,
        private fieldDefintionService: FieldDefinitionService) {
    }


    dato$(rowData: any, fieldDefinition: FieldDefinition): Observable<any> {
        const fullValue = rowData[fieldDefinition.name];
        if (!fullValue) {
            return of('');
        }

        if (fieldDefinition.type === 'join') {
            const labelField = this.fieldDefintionService.fetchFirstLabel(fieldDefinition);
            return this.apiService.fetchObject(this.metadataName, fullValue, fieldDefinition.join_table_select_fields)
                .pipe(
                    map(join => join[labelField])
                );
        }
        if (fieldDefinition.type === 'multijoin') {
            return this.apiService.fetchJoinList(this.metadataName, this.getTableKey(rowData),
                fieldDefinition.join_table_name,
                fieldDefinition.join_table_select_fields)
                .pipe(map(join => join[this.fieldDefintionService.fetchFirstLabel(fieldDefinition)]));
        }
        return of(fullValue);
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
        this.apiService._start = 0;
        this.apiService._limit = 10;

        this.route.data
            .subscribe(
                (data: { fieldDefinitionValorized: FieldDefinition[] }) => {
                    this.regConfigList = data.fieldDefinitionValorized;
                    for (const field of this.regConfigList) {
                        if (field.searchable) {
                            this.regConfigSearch.push(field);
                        }
                    }
                }
            );
    }

    public newForm() {
        if (this.regConfigList) {
            this.router.navigate(['datalist/new', this.metadataName]);
        }

    }

    public edit(rowData: any) {
        this.router.navigate(['datalist/edit', this.metadataName, this.getTableKey(rowData)]);
    }

    public view(rowData: any) {
        this.router.navigate(['datalist/view', this.metadataName, this.getTableKey(rowData)]);
    }

    public loaddata(firstReload: boolean, datatable: any) {
        this.firstReload = firstReload;
        this.preLoaddata();

        if (this.searchForm && this.searchForm.value) {
            const objToSearch = JSON.parse(JSON.stringify(this.searchForm.value));
            for (const k in objToSearch) {
                if (objToSearch.hasOwnProperty(k)) {
                    for (const field of this.regConfigSearch) {
                        if (field.name === k) {
                            field.value = objToSearch[field.name];
                        }
                    }
                }
            }
        }
        this.preSearch();
        this.apiService.getList(this.metadataName, this.regConfigSearch).subscribe(
            model => {
                console.log(model);
                this.model = model;
            }
        );
    }

    public preLoaddata() {
    }

    public lazyLoad(
        event: any, datatable?: any) {
        if (!this.firstReload) {
            this.apiService._start = event.first;
        }
        this.apiService._limit = event.rows;
        // this.service.search.pageSize = event.rows;
        this.loaddata(this.firstReload, datatable);
        if (this.firstReload) {
            this.firstReload = false;
        }
    }

    public getTableKey(fieldDefinition: FieldDefinition): string {
        return fieldDefinition[this.metadata.table_key];
    }

    public reload(datatable: any) {
        this.apiService._start = 0;
        datatable.reset();
        this.refresh(datatable);
    }

    public refresh(datatable: any) {
        this.clearMsgs();
        datatable.reset();
    }

    public reset(datatable: any) {
        const obj = {};
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

    private preSearch() {
        if (this.searchForm && this.searchForm.value) {
            const objToSave = JSON.parse(JSON.stringify(this.searchForm.value));
            for (const k in objToSave) {
                if (objToSave.hasOwnProperty(k)) {
                    for (const field of this.regConfigSearch) {
                        if (field.name === k) {
                            field.value = objToSave[field.name];
                        }
                    }
                }
            }
        }
    }
}
