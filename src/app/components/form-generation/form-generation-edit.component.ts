import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../model/field-definition';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import {ApiService} from '../../service/api.service';
import * as moment from 'moment/moment';
import {ConfirmationService} from 'primeng/api';
import {Metadata} from '../../model/metadata';
import {MetadataService} from '../../service/metadata.service';

@Component(
    {
        templateUrl: './form-generation-edit.component.html',
        styleUrls: ['./form-generation-edit.component.css']
    }
)
export class FormGenerationEditComponent implements OnInit {

    @ViewChild(DynamicFormComponent, {static: false}) form: DynamicFormComponent;

    regConfig: FieldDefinition[] = [];
    errorMessage: string;
    metadataName: string;
    metadata: Metadata;
    uuid: string;

    constructor(
        protected router: Router,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private metadataService: MetadataService,
        private confirmationService: ConfirmationService) {

    }

    ngOnInit() {

        this.metadataService.buildSearch();
        this.metadataName = this.route.snapshot.params['name'];        
        this.metadataService.search.table_name = this.metadataName; 
        this.metadataService.getList().subscribe(
            metadata => {
                this.metadata = metadata;
            } 
        );
        this.uuid = this.route.snapshot.params['uuid'];
        this.regConfig = [];
        this.route.data
            .subscribe((data: { fieldDefinitionValorized: FieldDefinition[] }) => {
                this.regConfig = data.fieldDefinitionValorized;
                this.unarshallFields();
            });

    }

    delete() {
        this.apiService.delete(this.metadataName, this.uuid)
            .subscribe(
                element => {
                    console.log('record deleted result: ' + this.uuid);
                    this.router.navigate(['datalist/list', this.metadataName]);
                }
            );
    }

    confirmDelete() {
        if (!this.confirmationService) {
            return this.delete();
        }
        this.confirmationService.confirm({
            message: 'Confermi la cancellazione?',
            accept: () => {
                this.delete();
            }
        });

    }

    save() {
        const objToSave = this.preSaveUpdate();
        this.apiService.persist(this.metadataName, objToSave)
            .subscribe(
                element => {
                    if (element) {
                        const key = this.metadata.table_key;
                        console.log('record saved : ' + element);
                        this.router.navigate(['datalist/view', this.metadataName, element["uuid"]]);
                    }
                }
            );
    }


    update() {
        const objToSave = this.preSaveUpdate();
        this.apiService.update(this.metadataName, this.uuid, objToSave)
            .subscribe(
                element => {
                    if (element) {
                        console.log('record saved : ' + element);
                        this.router.navigate(['datalist/view', this.metadataName, this.uuid]);
                    }
                }
            );
    }

    cancel() {
        this.router.navigate(['datalist/list', this.metadataName]);
    }

    // TODO: lo riusciamo a portare in tags.component.ts?
    preSaveUpdate(): any {
        const objToSave = JSON.parse(JSON.stringify(this.form.value));
        for (const k in objToSave) {
            for (const field of this.regConfig) {
                delete field.is_edit;
                if (field.name === k) {
                    if (field.type === 'tags') {
                        objToSave[field.name] = objToSave[field.name].join(',');
                    }
                    if (field.type === 'multijoin') {
                        objToSave[field.name] = objToSave[field.name].join(',');
                    }
                    if (field.type === 'time') {
                        objToSave[field.name] = moment(objToSave[field.name], 'YYYY-MM-DD[T]HH:mm:ss[Z]').format('HH:mm:ss');
                    }
                    if (field.type === 'date') {
                        objToSave[field.name] = moment(objToSave[field.name], 'YYYY-MM-DD[T]HH:mm:ss[Z]').format('YYYY-MM-DD');
                    }
                    if (field.type === 'datetime') {
                        objToSave[field.name] = moment(objToSave[field.name], 'YYYY-MM-DD[T]HH:mm:ss[Z]').format('YYYY-MM-DD HH:mm:ss');
                    }
                    // null = 0
                    if (field.type === 'input' &&
                        field.input_type === 'number' && objToSave[field.name]) {
                        objToSave[field.name] = +objToSave[field.name];
                    }
                }
            }
        }
        return objToSave;
    }


    // TODO: lo riusciamo a portare in tags.component.ts?
    unarshallFields() {
        for (const field of this.regConfig) {
            if (field.type === 'tags') {
                if (field.value == null) {
                    field.value = [];
                } else {
                    field.value = (<string>field.value).split(',');
                }
            }
            if (field.type === 'multijoin') {
                if (field.value == null) {
                    field.value = [];
                } else {
                    field.value = (<string>field.value).split(',');
                }
            }
            if (field.type === 'time') {
                if (field.value != null) {
                    field.value = moment((<string>field.value), 'HH:mm:ss').toDate();
                }
            }
            if (field.type === 'date') {
                if (field.value != null) {
                    field.value = moment((<string>field.value), 'YYYY-MM-DD').toDate();
                }
            }
            if (field.type === 'datetime') {
                if (field.value != null) {
                    field.value = moment((<string>field.value), 'YYYY-MM-DD HH:mm:ss').toDate();
                }
            }
            if (field.type === 'multimedia') {
                if (field.value == null) {
                    field.value = [];
                } else {
                    field.value = (<string>field.value).split(',');
                }
            }
            if (field.input_type === 'decimal') {
                // decimal nel backend corrisponde a number
                field.input_type = 'number';
            }
        }
    }

}

