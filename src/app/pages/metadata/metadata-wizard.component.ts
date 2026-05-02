import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {CdkDragDrop, DragDropModule, copyArrayItem, moveItemInArray} from '@angular/cdk/drag-drop';
import {forkJoin, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {MessageService, SelectItem} from 'primeng/api';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {Textarea} from 'primeng/textarea';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FieldDefinition} from '../../models/field-definition';
import {Metadata} from '../../models/metadata';
import {FONT_AWESOME_ICONS, MAP_INPUT_TO_FIELD} from '../../constants/constants';
import {MetadataService} from '../../services/metadata.service';
import {FieldDefinitionService} from '../../services/field-definition.service';
import {WizardField, WizardStep} from '../../models/wizard-field';

@Component({
    standalone: true,
    selector: 'metadata-wizard',
    templateUrl: './metadata-wizard.component.html',
    styleUrl: './metadata-wizard.component.scss',
    imports: [
        CommonModule,
        SideBarComponent,
        AdminhomeTopBar,
        ReactiveFormsModule,
        FormsModule,
        InputText,
        SelectModule,
        ToggleSwitchModule,
        Textarea,
        DragDropModule
    ]
})
export class MetadataWizardComponent {
    step: WizardStep = 1;

    readonly uuidTypes: SelectItem[] = [
        {value: 'uuid', label: 'uuid'},
        {value: 'slug', label: 'slug'},
        {value: 'autoincrement', label: 'auto increment'},
        {value: 'userdefined', label: 'user defined'}
    ];

    readonly uuidPalette = this.uuidTypes.map(item => String(item.value));
    readonly fieldGroups: {name: string; types: string[]}[] = [
        {name: 'base',   types: ['string', 'number', 'decimal', 'password', 'email', 'text', 'boolean', 'passivation']},
        {name: 'editor', types: ['tinymce', 'monaco']},
        {name: 'time',   types: ['date', 'datetime', 'time']},
        {name: 'media',  types: ['media', 'image']},
        {name: 'join',   types: ['select', 'tags', 'join', 'multijoin', 'realtionships']},
        {name: 'maps',   types: ['gmaplocation', 'gmappath']}
    ];
    readonly fieldPalette = this.fieldGroups.flatMap(g => g.types);
    openGroup = 'base';

    get palettePanelIds(): string[] {
        return this.fieldGroups.map(g => `fieldPalette_${g.name}`);
    }
    readonly iconItems: SelectItem[] = FONT_AWESOME_ICONS;
    readonly defaultSearchConditionByFieldType: {[key: string]: string} = {
        string: 'contains',
        text: 'contains',
        number: '',
        decimal: '',
        password: '',
        email: '',
        select: '',
        date: '',
        datetime: '',
        time: '',
        boolean: '',
        passivation: '',
        tinymce: 'contains',
        monaco: 'contains',
        tags: 'contains',
        join: '',
        multijoin: 'contains',
        realtionships: 'contains',
        media: 'null',
        image: 'null',
        gmaplocation: '',
        gmappath: ''
    };

    readonly fieldTypeIconMap: {[key: string]: string} = {
        string: 'fa fa-font',
        number: 'fa fa-hashtag',
        decimal: 'fa fa-calculator',
        password: 'fa fa-lock',
        email: 'fa fa-envelope',
        text: 'fa fa-align-left',
        tinymce: 'fa fa-file-text-o',
        monaco: 'fa fa-code',
        boolean: 'fa fa-check-square-o',
        passivation: 'fa fa-toggle-on',
        date: 'fa fa-calendar',
        datetime: 'fa fa-clock-o',
        time: 'fa fa-hourglass-half',
        select: 'fa fa-list',
        media: 'fa fa-photo',
        image: 'fa fa-image',
        tags: 'fa fa-tags',
        join: 'fa fa-link',
        multijoin: 'fa fa-chain',
        realtionships: 'fa fa-sitemap',
        gmaplocation: 'fa fa-map-marker',
        gmappath: 'fa fa-map'
    };

    readonly uuidTypeIconMap: {[key: string]: string} = {
        uuid: 'fa fa-fingerprint',
        slug: 'fa fa-link',
        autoincrement: 'fa fa-sort-numeric-asc',
        userdefined: 'fa fa-user'
    };

    metadata: Metadata = new Metadata();
    metadataLabel = '';
    private metadataLabelManuallyEdited = false;
    fields: WizardField[] = [];
    selectedFieldId?: string;
    selectedUuidType = 'uuid';
    apiProtected = false;
    isSaving = false;
    orderByField = '';
    orderByDirection = 'ASC';
    readonly orderByDirections: SelectItem[] = [
        {value: 'ASC', label: 'ASC'},
        {value: 'DESC', label: 'DESC'}
    ];

    readonly searchConditionItems: SelectItem[] = [
        {label: 'equals', value: ''},
        {label: 'not equals', value: 'ne'},
        {label: 'less than', value: 'lt'},
        {label: 'greater than', value: 'gt'},
        {label: 'less or equal', value: 'lte'},
        {label: 'greater or equal', value: 'gte'},
        {label: 'contains', value: 'contains'},
        {label: 'contains case insensitive', value: 'icontains'}
    ];

    private readonly router = inject(Router);
    private readonly metadataService = inject(MetadataService);
    private readonly fieldDefinitionService = inject(FieldDefinitionService);
    private readonly messageService = inject(MessageService);

    constructor() {
        this.metadata.icon = this.iconItems[0]?.value as string;
        this.metadata.table_key = 'uuid';
        this.metadata.table_key_type = 'uuid';
        this.metadataLabel = this.buildLabelFromTableName(this.metadata.table_name);
    }

    get selectedField(): WizardField | undefined {
        return this.fields.find(field => field.wizardId === this.selectedFieldId);
    }

    get orderByFieldOptions(): SelectItem[] {
        const none: SelectItem = {value: '', label: '— none —'};
        return [none, ...this.fields.map(f => ({value: f.name ?? '', label: `${f.label || f.name} (${f.fieldType})`}))];
    }

    onTableNameChanged() {
        if (!this.metadataLabelManuallyEdited) {
            this.metadataLabel = this.buildLabelFromTableName(this.metadata.table_name);
        }
    }

    onMetadataLabelChanged() {
        this.metadataLabelManuallyEdited = true;
    }

    getFieldTypeIcon(fieldType: string): string {
        return this.fieldTypeIconMap[fieldType] ?? 'fa fa-square-o';
    }

    getUuidTypeIcon(uuidType: string): string {
        return this.uuidTypeIconMap[uuidType] ?? 'fa fa-square-o';
    }

    get canGoToStepThree(): boolean {
        return this.validateStepTwo(false);
    }

    get canNavigateToStep2(): boolean {
        return this.validateStepOne(false);
    }

    get canNavigateToStep3(): boolean {
        return this.validateStepOne(false) && this.validateStepTwo(false);
    }

    dropUuidType(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            return;
        }

        const droppedType = event.item.data ? String(event.item.data) : '';
        if (!droppedType) {
            return;
        }

        this.selectedUuidType = droppedType;
        this.metadata.table_key_type = droppedType;
        if (droppedType === 'uuid' && !this.metadata.table_key) {
            this.metadata.table_key = 'uuid';
        }
    }

    dropFieldType(event: CdkDragDrop<string[] | WizardField[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
            this.fields.forEach((field, index) => field.order_num = index + 1);
            return;
        }

        const droppedFieldType = event.item.data ? String(event.item.data) : '';
        if (!droppedFieldType) {
            return;
        }

        const paletteSnapshot = [...this.fieldPalette];
        copyArrayItem(paletteSnapshot, this.fields as any[], event.previousIndex, event.currentIndex);
        this.fields.splice(event.currentIndex, 1, this.createFieldFromType(droppedFieldType, event.currentIndex));
        this.fields.forEach((field, index) => field.order_num = index + 1);
        this.selectedFieldId = this.fields[event.currentIndex].wizardId;
    }

    selectField(field: WizardField) {
        this.selectedFieldId = field.wizardId;
    }

    removeField(fieldToRemove: WizardField) {
        this.fields = this.fields.filter(field => field.wizardId !== fieldToRemove.wizardId);
        this.fields.forEach((field, index) => field.order_num = index + 1);
        if (this.selectedFieldId === fieldToRemove.wizardId) {
            this.selectedFieldId = this.fields[0]?.wizardId;
        }
    }

    goToStep(target: WizardStep) {
        if (target === this.step) { return; }
        if (target === 1) { this.step = 1; return; }
        if (target >= 2) {
            if (!this.validateStepOne(false)) { return; }
            if (target === 2) { this.syncAutoFields(); this.step = 2; return; }
        }
        if (target === 3) {
            if (!this.validateStepTwo(false)) { return; }
            this.step = 3;
        }
    }

    nextStep() {
        if (this.step === 1) {
            if (!this.validateStepOne(true)) {
                return;
            }
            this.syncAutoFields();
            this.step = 2;
            return;
        }

        if (this.step === 2) {
            if (!this.validateStepTwo(true)) {
                return;
            }
            this.step = 3;
        }
    }

    prevStep() {
        if (this.step > 1) {
            this.step = (this.step - 1) as WizardStep;
        }
    }

    private syncAutoFields() {
        // Remove previously auto-generated fields
        this.fields = this.fields.filter(f => !f.isSlugField && !f.isUsernameField);

        const autoFields: WizardField[] = [];

        if (this.selectedUuidType === 'slug') {
            const name = (this.metadata.table_key_addition ?? '').trim();
            if (name) {
                const slugField = this.createFieldFromType('string', 0);
                slugField.name = name;
                slugField.label = this.buildLabelFromTableName(name);
                slugField.mandatory = true;
                slugField.isSlugField = true;
                autoFields.push(slugField);
            }
        }

        if (this.apiProtected) {
            const name = (this.metadata.username_field ?? '').trim();
            if (name) {
                const usernameField = this.createFieldFromType('string', 0);
                usernameField.name = name;
                usernameField.label = this.buildLabelFromTableName(name);
                usernameField.mandatory = true;
                usernameField.isUsernameField = true;
                autoFields.push(usernameField);
            }
        }

        this.fields = [...autoFields, ...this.fields];
        this.fields.forEach((f, i) => f.order_num = i + 1);
    }

    onShowInListChange(field: WizardField) {
        if (!field.show_in_list) {
            field.searchable = false;
            field.search_condition = '';
        }
    }

    onSearchableChange(field: WizardField) {
        if (!field.searchable) {
            field.search_condition = '';
        } else {
            field.search_condition = this.defaultSearchConditionByFieldType[field.fieldType] ?? '';
        }
    }

    onFieldNameChange(field: WizardField) {
        const value = (field.name ?? '').trim();
        if (!value) {
            this.enforceMandatoryWhenSlugKeyAddition(field);
            return;
        }

        field.label = value
            .replace(/[_-]+/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        this.enforceMandatoryWhenSlugKeyAddition(field);
    }

    createAll() {
        if (!this.validateStepOne(true) || !this.validateStepTwo(true) || this.isSaving) {
            return;
        }

        this.isSaving = true;
        const metadataToPersist = this.buildMetadataPayload();

        this.metadataService.persist(metadataToPersist).pipe(
            switchMap(savedMetadata => {
                const fieldRequests = this.fields.map((field, index) => {
                    const payload = this.buildFieldPayload(field, savedMetadata, index + 1);
                    return this.fieldDefinitionService.persist(payload);
                });

                if (fieldRequests.length === 0) {
                    return of(savedMetadata);
                }

                return forkJoin(fieldRequests).pipe(switchMap(() => of(savedMetadata)));
            })
        ).subscribe({
            next: (savedMetadata) => {
                this.isSaving = false;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Wizard completed: metadata and field definitions saved.'
                });
                this.router.navigate(['/metadata/view', savedMetadata.uuid]);
            },
            error: (error) => {
                this.isSaving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error while saving the wizard.',
                    detail: String(error || '')
                });
            }
        });
    }

    navigateToList() {
        this.router.navigate(['/metadata/list']);
    }

    private createFieldFromType(fieldType: string, index: number): WizardField {
        const field = new FieldDefinition() as WizardField;
        field.wizardId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        field.fieldType = fieldType;
        field.name = `field_${this.fields.length + 1}`;
        field.label = `Field ${this.fields.length + 1}`;
        field.mandatory = false;
        field.show_in_list = false;
        field.searchable = false;
        field.search_condition = '';
        field.default_value = '';
        field.sql_type = '';
        field.sql_definition = '';
        field.pattern = '';
        field.definition = '';
        field.options = fieldType === 'select' ? '' : undefined;
        field.join_table_name = '';
        field.join_table_key = '';
        field.join_table_select_fields = '';
        field.order_num = index + 1;
        field.is_edit = false;
        return field;
    }

    private validateStepOne(showMessage: boolean): boolean {
        if (!this.metadata.table_name || !this.metadata.table_name.trim()) {
            if (showMessage) {
                this.showValidationError('Step 1: Table Name is required.');
            }
            return false;
        }

        if (!this.metadataLabel || !this.metadataLabel.trim()) {
            if (showMessage) {
                this.showValidationError('Step 1: Label is required.');
            }
            return false;
        }

        if (!this.metadata.table_key || !this.metadata.table_key.trim()) {
            if (showMessage) {
                this.showValidationError('Step 1: Table key is required.');
            }
            return false;
        }

        if (!this.selectedUuidType) {
            if (showMessage) {
                this.showValidationError('Step 1: drag a UUID type into the dedicated box.');
            }
            return false;
        }

        if (this.selectedUuidType === 'slug' && !(this.metadata.table_key_addition ?? '').trim()) {
            if (showMessage) {
                this.showValidationError('Step 1: with table key type slug, "Name of field" is required.');
            }
            return false;
        }

        if (this.apiProtected && !(this.metadata.username_field ?? '').trim()) {
            if (showMessage) {
                this.showValidationError('Step 1: with API protected enabled, Username Field is required.');
            }
            return false;
        }

        return true;
    }

    private validateStepTwo(showMessage: boolean): boolean {
        if (this.fields.length === 0) {
            if (showMessage) {
                this.showValidationError('Step 2: add at least one field definition using drag and drop.');
            }
            return false;
        }

        for (const field of this.fields) {
            if (!(field.name ?? '').trim() || /\s/.test(field.name ?? '')) {
                if (showMessage) {
                    this.showValidationError(`Step 2: field name "${field.label || field.fieldType}" is required and cannot contain spaces.`);
                }
                return false;
            }

            if (!(field.label ?? '').trim()) {
                if (showMessage) {
                    this.showValidationError(`Step 2: label for field "${field.name}" is required.`);
                }
                return false;
            }
        }

        if (this.selectedUuidType === 'slug') {
            const keyAddition = (this.metadata.table_key_addition ?? '').trim();
            const hasKeyAdditionField = this.fields.some(field => (field.name ?? '').trim() === keyAddition);
            if (!hasKeyAdditionField) {
                if (showMessage) {
                    this.showValidationError('Step 2: with table key type slug, a field with name equal to "Name of field" is required.');
                }
                return false;
            }
        }

        if (this.apiProtected) {
            const usernameFieldName = (this.metadata.username_field ?? '').trim();
            const hasUsernameField = this.fields.some(field => (field.name ?? '').trim() === usernameFieldName);
            if (!hasUsernameField) {
                if (showMessage) {
                    this.showValidationError('Step 2: with API protected enabled, a field with name equal to Username Field is required.');
                }
                return false;
            }
        }

        return true;
    }

    private buildMetadataPayload(): Metadata {
        const payload = {...this.metadata};
        payload.table_key_type = this.selectedUuidType;
        payload.already_exist = false;
        payload.api_protected = this.apiProtected;
        payload.order_by = this.orderByField ? `${this.orderByField} ${this.orderByDirection}` : '';
        if (!this.apiProtected) {
            payload.username_field = '';
        }
        return payload;
    }

    private buildFieldPayload(field: WizardField, metadata: Metadata, orderNum: number): FieldDefinition {
        const fieldTypeMapping = MAP_INPUT_TO_FIELD.get(field.fieldType);
        const payload = {...field} as any;
        delete payload.wizardId;
        delete payload.fieldType;
        delete payload.isSlugField;
        delete payload.isUsernameField;
        delete payload.value;
        delete payload.is_edit;
        delete payload.uuid;

        payload.metadata_uuid = metadata.uuid;
        payload.metadata_name = metadata.table_name;
        payload.order_num = orderNum;
        payload.type = fieldTypeMapping ? fieldTypeMapping[0] : 'input';
        payload.input_type = fieldTypeMapping ? fieldTypeMapping[1] : 'text';

        if (!payload.searchable) {
            payload.search_field_name = '';
        } else {
            payload.search_field_name = payload.search_condition
                ? `${payload.name}_${payload.search_condition}`
                : payload.name;
        }

        if (payload.input_type !== 'join' && payload.input_type !== 'multijoin' && payload.type !== 'join' && payload.type !== 'multijoin') {
            payload.join_table_name = '';
            payload.join_table_key = '';
            payload.join_table_select_fields = '';
        }

        this.enforceMandatoryWhenSlugKeyAddition(payload as WizardField);
        return payload as FieldDefinition;
    }

    private enforceMandatoryWhenSlugKeyAddition(field: WizardField) {
        const keyAddition = (this.metadata.table_key_addition ?? '').trim();
        if (this.selectedUuidType === 'slug' && keyAddition && (field.name ?? '').trim() === keyAddition) {
            field.mandatory = true;
        }
    }

    private showValidationError(summary: string) {
        this.messageService.add({
            severity: 'error',
            summary
        });
    }

    private buildLabelFromTableName(tableName?: string): string {
        const value = (tableName ?? '').trim();
        if (!value) {
            return '';
        }

        return value
            .replace(/[_-]+/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}