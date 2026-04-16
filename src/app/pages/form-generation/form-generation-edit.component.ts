import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinition} from '../../models/field-definition';
import {DynamicFormComponent} from '../../generic.components/dynamic-form/dynamic-form.component';
import {ApiService} from '../../services/api.service';
import {ConfirmationService} from 'primeng/api';
import {Metadata} from '../../models/metadata';
import {MetadataService} from '../../services/metadata.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { HomepageTopBar } from '../homepage-topbar/homepage-topbar.component';

@Component({
    standalone: true,
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
    cloneUuid?: string;
    cloneLoaded = false;

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
                if (this.cloneUuid) {
                    this.tryLoadCloneSource();
                }
            }
        );
        // todo: eliminare quando abbiamo capito la gerarchia delle iniezioni
        this.metadataService.buildSearch();
        delete this.metadataService.search.uuid;
        this.uuid = this.route.snapshot.params['uuid'];
        this.cloneUuid = this.route.snapshot.queryParamMap.get('clone_uuid') ?? undefined;
        this.regConfig = [];
        this.route.data
            .subscribe((data: unknown) => {
                const resolved = (data as { fieldDefinitionValorized?: FieldDefinition[] })?.fieldDefinitionValorized;
                this.regConfig = resolved ?? [];
                this.unarshallFields();
                this.applyDefaultValues();
                this.syncFormValues();
                if (this.cloneUuid) {
                    this.tryLoadCloneSource();
                }
            });

    }

    delete() {
        this.apiService.delete(this.metadataName, this.uuid)
            .subscribe(
                element => {
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
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonProps: {
                severity: 'danger',
                outlined: false
            },
            rejectButtonProps: {
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.delete();
            }
        });

    }

    save() {
        if (!this.checkMandatoryFields()) {
            return;
        }
        const objToSave = this.preSaveUpdate();
        this.apiService.persist(this.metadataName, objToSave)
            .subscribe(
                element => {
                    if (element) {
                        const key = this.metadata.table_key;
                        this.router.navigate(['datalist/view', this.metadataName, element[key]]);
                    }
                }
            );
    }


    update() {
        if (!this.checkMandatoryFields()) {
            return;
        }
        const objToSave = this.preSaveUpdate();
        this.apiService.update(this.metadataName, this.uuid, objToSave)
            .subscribe(
                element => {
                    if (element) {
                        this.router.navigate(['datalist/view', this.metadataName, this.uuid]);
                    }
                }
            );
    }

    private checkMandatoryFields(): boolean {
        if (this.form?.form) {
            if (!this.form.form.valid) {
                this.form.validateAllFormFields(this.form.form);
                this.form.focusFirstInvalidField();
                const missingRequiredFields = this.getMissingRequiredFields(this.form.value);
                if (missingRequiredFields.length > 0) {
                    this.errorMessage = `Compila i campi obbligatori: ${missingRequiredFields.join(', ')}.`;
                } else {
                    this.errorMessage = 'Controlla i campi evidenziati prima di salvare.';
                }
                return false;
            }
            this.errorMessage = '';
            return true;
        }
        // fallback: verifica diretta sui regConfig
        const formValue = this.form?.value ?? {};
        const missingRequiredFields = this.getMissingRequiredFields(formValue);
        if (missingRequiredFields.length > 0) {
            this.errorMessage = `Compila i campi obbligatori: ${missingRequiredFields.join(', ')}.`;
            return false;
        }
        this.errorMessage = '';
        return true;
    }

    cancel() {
        this.router.navigate(['datalist/list', this.metadataName]);
    }

    private tryLoadCloneSource() {
        if (!this.cloneUuid || this.uuid || this.cloneLoaded || !this.metadata || this.regConfig.length === 0) {
            return;
        }

        this.apiService.fetchObject(this.metadataName, this.cloneUuid).subscribe({
            next: source => {
                this.applyCloneValues(source);
                this.unarshallFields();
                this.syncFormValues();
                this.cloneLoaded = true;
            },
            error: () => {
                this.errorMessage = 'Unable to load source data for clone.';
                this.cloneLoaded = true;
            }
        });
    }

    private syncFormValues() {
        if (!this.form?.form) {
            return;
        }
        const valuesToPatch: Record<string, any> = {};
        for (const field of this.regConfig) {
            if (field.name) {
                valuesToPatch[field.name] = field.value;
            }
        }
        this.form.form.patchValue(valuesToPatch, { emitEvent: false });
    }

    private applyCloneValues(source: Record<string, any>) {
        const primaryKey = this.metadata?.table_key;

        for (const field of this.regConfig) {
            if (!field.name) {
                continue;
            }

            const isPrimaryKeyField = field.table_key === true
                || (primaryKey != null && field.name === primaryKey)
                || field.name === 'uuid';

            if (isPrimaryKeyField) {
                field.value = undefined;
                continue;
            }

            field.value = source[field.name];
        }
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

    private getMissingRequiredFields(formValue: Record<string, any>): string[] {
        return this.regConfig
            .filter(field => field.mandatory)
            .filter(field => {
                const value = formValue[field.name];
                if (value == null) {
                    return true;
                }
                if (typeof value === 'string') {
                    return value.trim().length === 0;
                }
                if (Array.isArray(value)) {
                    return value.length === 0;
                }
                return false;
            })
            .map(field => field.label || field.name);
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
                        const rawValues = objToSave[field.name];
                        if (Array.isArray(rawValues)) {
                            const values = rawValues
                                .map(value => typeof value === 'object' && value != null
                                    ? value[field.join_table_key]
                                    : value)
                                .filter(value => value != null && value !== '');
                            objToSave[field.name] = values.join(',');
                        }
                    }
                    if (field.type === 'join') {
                        const rawValue = objToSave[field.name];
                        objToSave[field.name] = typeof rawValue === 'object' && rawValue != null
                            ? rawValue[field.join_table_key]
                            : rawValue;
                    }
                    if (field.type === 'realtionships') {
                        const rawValues = objToSave[field.name];
                        if (Array.isArray(rawValues)) {
                            objToSave[field.name] = rawValues.join(',');
                        }
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


    private applyDefaultValues() {
        if (this.uuid) {
            return;
        }
        for (const field of this.regConfig) {
            const defaultVal = (field.default_value ?? '').trim();
            if (defaultVal === '') {
                continue;
            }
            if (field.value != null && field.value !== '') {
                continue;
            }
            if (defaultVal.toLowerCase() === 'now()') {
                if (field.type === 'date' || field.type === 'datetime') {
                    field.value = new Date();
                }
            } else if (field.type === 'date') {
                field.value = this.parseDate(defaultVal);
            } else if (field.type === 'datetime') {
                field.value = this.parseDateTime(defaultVal);
            } else {
                field.value = defaultVal;
            }
        }
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
            if (field.type === 'join') {
                if (typeof field.value === 'object' && field.value != null) {
                    field.value = field.value[field.join_table_key];
                }
            }
            if (field.type === 'multijoin') {
                if (field.value == null || field.value === '') {
                    field.value = [];
                } else if (Array.isArray(field.value)) {
                    field.value = field.value
                        .map(value => typeof value === 'object' && value != null
                            ? value[field.join_table_key]
                            : value)
                        .filter(value => value != null && value !== '');
                } else {
                    field.value = (<string>field.value)
                        .split(',')
                        .map(value => value.trim())
                        .filter(Boolean);
                }
            }
            if (field.type === 'realtionships') {
                if (field.value == null || field.value === '') {
                    field.value = [];
                } else if (Array.isArray(field.value)) {
                    // Already an array
                    field.value = field.value.filter(value => value != null && value !== '');
                } else {
                    // String separated by comma
                    field.value = (<string>field.value)
                        .split(',')
                        .map(value => value.trim())
                        .filter(Boolean);
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

