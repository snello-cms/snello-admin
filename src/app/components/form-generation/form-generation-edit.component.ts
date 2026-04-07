import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../model/field-definition';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import {ApiService} from '../../service/api.service';
import {ConfirmationService} from 'primeng/api';
import {Metadata} from '../../model/metadata';
import {MetadataService} from '../../service/metadata.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';

@Component({
    templateUrl: './form-generation-edit.component.html',
    providers: [MetadataService],
    imports: [SideBarComponent, HomepageTopBar, DynamicFormComponent]
})
export class FormGenerationEditComponent implements OnInit {

    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

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
        delete this.metadataService.search.uuid;
        this.metadataName = this.route.snapshot.params['name'];
        this.metadataService.search.table_name = this.metadataName;

        this.metadataService.getList().subscribe(
            metadata => {
                if (metadata && metadata.length > 0) {
                    this.metadata = metadata[0];
                }

            }
        );
        // todo: eliminare quando abbiamo capito la gerarchia delle iniezioni
        this.metadataService.buildSearch();
        delete this.metadataService.search.uuid;
        this.uuid = this.route.snapshot.params['uuid'];
        this.regConfig = [];
        this.route.data
            .subscribe((data: unknown) => {
                const resolved = (data as { fieldDefinitionValorized?: FieldDefinition[] })?.fieldDefinitionValorized;
                this.regConfig = resolved ?? [];
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
            message: 'Do you really want to delete this record?',
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
                        this.router.navigate(['datalist/view', this.metadataName, element[key]]);
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

    private toDate(value: unknown): Date | null {
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === 'string' && value.length > 0) {
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    }

    private pad(value: number): string {
        return value.toString().padStart(2, '0');
    }

    private formatTime(value: unknown): string {
        const date = this.toDate(value);
        if (!date) {
            return '';
        }
        return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`;
    }

    private formatDate(value: unknown): string {
        const date = this.toDate(value);
        if (!date) {
            return '';
        }
        return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
    }

    private formatDateTime(value: unknown): string {
        const date = this.toDate(value);
        if (!date) {
            return '';
        }
        const timezoneOffsetMinutes = -date.getTimezoneOffset();
        const sign = timezoneOffsetMinutes >= 0 ? '+' : '-';
        const absoluteOffsetMinutes = Math.abs(timezoneOffsetMinutes);
        const offsetHours = this.pad(Math.floor(absoluteOffsetMinutes / 60));
        const offsetMinutes = this.pad(absoluteOffsetMinutes % 60);

        return `${this.formatDate(date)}T${this.formatTime(date)}${sign}${offsetHours}:${offsetMinutes}`;
    }

    private parseTime(value: string): Date {
        const [hours = '0', minutes = '0', seconds = '0'] = value.split(':');
        const date = new Date();
        date.setHours(+hours, +minutes, +seconds, 0);
        return date;
    }

    private parseDate(value: string): Date {
        const [year = '1970', month = '1', day = '1'] = value.split('-');
        return new Date(+year, +month - 1, +day);
    }

    private parseDateTime(value: string): Date {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }

        const [datePart = '', timePart = '00:00:00'] = value.split(' ');
        const date = this.parseDate(datePart);
        const [hours = '0', minutes = '0', seconds = '0'] = timePart.split(':');
        date.setHours(+hours, +minutes, +seconds, 0);
        return date;
    }

    // TODO: lo riusciamo a portare in tags.component.ts?
    preSaveUpdate(): any {
        const objToSave = JSON.parse(JSON.stringify(this.form.value));
        // tslint:disable-next-line:forin
        for (const k in objToSave) {
            for (const field of this.regConfig) {
                field.is_edit = false;
                if (field.name === k) {
                    if (field.type === 'tags') {
                        objToSave[field.name] = objToSave[field.name].join(',');
                    }
                    if (field.type === 'multijoin') {
                        const values: any[] = [];
                        for (const value of  objToSave[field.name]) {
                            values.push(value[field.join_table_key]);
                        }
                        objToSave[field.name] = values.join(',');
                    }
                    if (field.type === 'join') {
                        objToSave[field.name] = objToSave[field.name][field.join_table_key];
                    }
                    if (field.type === 'time') {
                        objToSave[field.name] = this.formatTime(objToSave[field.name]);
                    }
                    if (field.type === 'date') {
                        objToSave[field.name] = this.formatDate(objToSave[field.name]);
                    }
                    if (field.type === 'datetime') {
                        objToSave[field.name] = this.formatDateTime(objToSave[field.name]);
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
            if (field.type === 'time') {
                if (field.value != null) {
                    field.value = this.parseTime((<string>field.value));
                }
            }
            if (field.type === 'date') {
                if (field.value != null) {
                    field.value = this.parseDate((<string>field.value));
                }
            }
            if (field.type === 'datetime') {
                if (field.value != null) {
                    field.value = this.parseDateTime((<string>field.value));
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

