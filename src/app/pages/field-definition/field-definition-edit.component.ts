import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FieldDefinitionService} from '../../services/field-definition.service';
import {MetadataService} from '../../services/metadata.service';
import {FieldDefinition} from '../../models/field-definition';
import {MAP_INPUT_TO_FIELD} from '../../constants/constants';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {Metadata} from '../../models/metadata';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    standalone: true,
    templateUrl: './field-definition-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, SelectModule, InputText, Textarea, ToggleSwitchModule]
})
export class FieldDefinitionEditComponent extends AbstractEditComponent<FieldDefinition> implements OnInit {

    private readonly defaultSearchConditionItems: SelectItem[] = [
        {label: 'equals', value: ''},
        {label: 'not equals', value: 'ne'},
        {label: 'less than', value: 'lt'},
        {label: 'greater than', value: 'gt'},
        {label: 'less or equal', value: 'lte'},
        {label: 'greater or equal', value: 'gte'},
        {label: 'contains', value: 'contains'},
        {label: 'contains case insensitive', value: 'contains'}];

    private readonly dateSearchConditionItems: SelectItem[] = [
        {label: '=', value: ''},
        {label: '<', value: 'lt'},
        {label: '<=', value: 'lte'},
        {label: '>', value: 'gt'},
        {label: '>=', value: 'gte'},
        {label: 'range', value: 'range'}
    ];

    metadatas: Metadata[] = [];
    metadatasSelect: Metadata[] = [];
    selectedMetadata: Metadata | null = null;
    joinMetadatasSelect: Metadata[] = [];
    selectedJoinMetadata: Metadata | null = null;
    joinFieldOptions: SelectItem[] = [];
    selectedJoinField?: string;
    fieldType?: string;
    pageBack: string;
    uuidBack: string;
    public advanced = false;

    fieldTypes: SelectItem[] = [];

    mapFieldToType: Map<string, string> = new Map();
    mapMetadata: Map<string, Metadata> = new Map();

    tabs: SelectItem[] = [];
    groups: SelectItem[] = [];

    tabToGroups: Map<string, SelectItem[]> = new Map();
    searchConditionItems: SelectItem[] = [...this.defaultSearchConditionItems];

    componentDefaultValuesMapper = {
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
        lookup: '',
        multijoin: 'contains',
        multilookup: '',
        realtionships: 'contains',
        media: 'null',
        image: 'null'
    };

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public fieldDefinitionService: FieldDefinitionService,
        public metadataService: MetadataService,
        public messageService: MessageService,
    ) {
        super(router, route, confirmationService, fieldDefinitionService, messageService, 'fielddefinition');
        for (const key of Array.from(MAP_INPUT_TO_FIELD.keys())) {
            this.fieldTypes.push({value: key, label: key});
            const fieldDefType = MAP_INPUT_TO_FIELD.get(key);
            if (fieldDefType) {
                this.mapFieldToType.set(this.buildFieldTypeKey(fieldDefType[0], fieldDefType[1]), key);
            }
        }
    }

    private buildFieldTypeKey(type?: string, inputType?: string | null): string {
        return `${type ?? ''}::${inputType ?? ''}`;
    }


    ngOnInit() {
        this.metadatas = [];
        this.metadatasSelect = [];
        this.element = new FieldDefinition();
        if (this.route.snapshot.queryParamMap.has('pageBack')) {
            this.pageBack = this.route.snapshot.queryParams['pageBack'];
        }
        if (this.route.snapshot.queryParamMap.has('uuidBack')) {
            this.uuidBack = this.route.snapshot.queryParams['uuidBack'];
        }

        const id: string = this.route.snapshot.params['id'];
        this.metadataService.getAllList({
            table_name_contains: '',
            uuid: '',
            _limit: 100000
        }).pipe(
            map(
                metadataList => {
                    this.valorizeMetadatas(metadataList);
                    return metadataList;
                }
            ),
            switchMap(
                () => {
                    if (id) {
                        return this.service.find(id);
                    }
                    return of(null);
                }
            ),
            map(
                element => {
                    if (element) {
                        this.element = <FieldDefinition>element;
                        this.ensureMetadataOption(this.element.metadata_uuid);
                        this.selectedMetadata = this.mapMetadata.get(this.element.metadata_uuid) ?? null;
                        this.initializeJoinMetadata();
                        this.postFind();
                    } else {
                        this.editMode = false;
                        this.element = this.createInstance();
                        this.selectedMetadata = null;
                        this.initializeJoinMetadata();
                        this.postCreate();
                    }

                }
            ),
            switchMap(
                () => {
                    return this.route.queryParamMap;
                }
            ),
            map(
                (params: Params) => {
                    if (!id && params && params.get('metadata_uuid')) {
                        const metadataUuid = params.get('metadata_uuid');
                        if (metadataUuid && this.mapMetadata.has(metadataUuid)) {
                            this.element.metadata_uuid = metadataUuid;
                            this.selectedMetadata = this.mapMetadata.get(metadataUuid) ?? null;
                            this.changedMetadata({value: this.selectedMetadata});
                        } else {
                            this.element.metadata_uuid = '';
                            this.selectedMetadata = null;
                        }
                    }
                }
            )
        ).subscribe(
            () => undefined,
            error => {
                this.addError('Error while loading data' + (error || ''));
            });
    }

    valorizeMetadatas(metadataList: Metadata[]) {
        this.metadatas = metadataList;
        this.mapMetadata.clear();
        this.metadatasSelect = [];
        for (let i = 0; i < this.metadatas.length; i++) {
            this.mapMetadata.set(this.metadatas[i].uuid, this.metadatas[i]);
            if (!this.metadatas[i].created) {
                this.metadatasSelect.push(this.metadatas[i]);
            }
        }
        this.updateJoinMetadataOptions();
    }

    private ensureMetadataOption(metadataUuid?: string) {
        if (!metadataUuid || this.mapMetadata.has(metadataUuid)) {
            return;
        }
        const currentMetadata = this.metadatas.find(m => m.uuid === metadataUuid);
        if (currentMetadata) {
            this.metadatasSelect.push(currentMetadata);
            this.mapMetadata.set(currentMetadata.uuid, currentMetadata);
        }
    }

    preSave(): boolean {
        if (!this.validateNameWithoutSpaces()) {
            return false;
        }
        this.pre();
        if (this.element.searchable) {
            const elementName = this.element.name ?? '';
            this.element.search_field_name = this.buildSearchFieldName(elementName, this.element.search_condition);
        }
        return super.preSave();
    }


    preUpdate(): boolean {
        if (!this.validateNameWithoutSpaces()) {
            return false;
        }
        this.pre();
        if (this.element.searchable) {
            const elementName = this.element.name ?? '';
            this.element.search_field_name = this.buildSearchFieldName(elementName, this.element.search_condition);
        }
        return super.preUpdate();
    }

    private buildSearchFieldName(elementName: string, searchCondition: string): string {
        if (!searchCondition) {
            return elementName;
        }

        if (searchCondition === 'range') {
            return `${elementName}_range`;
        }

        return `${elementName}_${searchCondition}`;
    }

    private validateNameWithoutSpaces(): boolean {
        const name = this.element?.name;
        if (typeof name !== 'string') {
            return true;
        }

        if (/\s/.test(name)) {
            this.addError('Name cannot contain spaces (leading, trailing, or between words).');
            return false;
        }

        return true;
    }

    pre() {
        this.enforceMandatoryForSlugKeyAddition();
        const fieldDefTypes = this.fieldType ? MAP_INPUT_TO_FIELD.get(this.fieldType) : undefined;
        const metadata = this.mapMetadata.get(this.element.metadata_uuid);
        if (metadata) {
            this.element.metadata_name = metadata.table_name;
        }
        if (fieldDefTypes) {
            this.element.type = fieldDefTypes[0];
            this.element.input_type = fieldDefTypes[1];
        }
        if (this.fieldType === 'lookup' || this.fieldType === 'multilookup') {
            this.element.search_condition = '';
        }
        delete this.element.value;
        delete (this.element as any).is_edit;
    }

    createInstance(): FieldDefinition {
        return new FieldDefinition();
    }

    postFind() {
        if (!this.element.input_type) {
            this.element.input_type = undefined;
        }
        this.fieldType = this.mapFieldToType.get(this.buildFieldTypeKey(this.element.type, this.element.input_type));
        this.syncSearchConditionItems();
        this.enforceMandatoryForSlugKeyAddition();
        this.syncJoinFieldsFromElement();
        super.postFind();
    }

    changedMetadata(event: any) {
        const selected = event && event.value ? event.value as Metadata : null;
        this.element.metadata_uuid = selected ? selected.uuid : '';
        this.selectedMetadata = selected;
        this.enforceMandatoryForSlugKeyAddition();
        this.updateJoinMetadataOptions();
        this.element.tab_name = undefined;
        this.element.group_name = undefined;
        this.tabs = [];
        this.groups = [];
        const meta = selected;

        // Carica il massimo order_num se siamo in create mode
        if (selected && this.element.metadata_uuid && !this.editMode) {
            this.loadMaxOrderNumber(this.element.metadata_uuid);
        }

        // Se la stringa contine un ';': ho sicuramente la divisione in tab. Splitto tutto, tiro fuori i tab e valuto le sottostringhe
        if (!meta || !meta.tab_groups) {
            return;
        }
        if (meta.tab_groups.includes(';')) {
            const tabsAndGroups = meta.tab_groups.split(';');
            for (const singleTabAndGroups of tabsAndGroups) {
                this.splitTabsAndGroups(singleTabAndGroups);
            }

        }

        // Se la stringa non contine ';' ma solo ',' ho una divisione in gruppi
        if (!meta.tab_groups.includes(';') && meta.tab_groups.includes(',')) {
            const grouped = meta.tab_groups.split(',');
            for (const group of grouped) {
                this.groups.push({label: group, value: group});
            }
        }
    }

    private loadMaxOrderNumber(metadataUuid: string) {
        // Se siamo in edit mode, non fare nulla
        if (this.editMode) {
            return;
        }

        // Crea la search per trovare tutti i field definitions di questo metadata
        const search = {
            metadata_uuid: metadataUuid,
            name_contains: '',
            uuid: '',
            _limit: 100000
        };

        // Carica i field definitions
        this.fieldDefinitionService.getListSearch(search, 0, 100000).subscribe(
            (fieldDefinitions: FieldDefinition[]) => {
                if (!fieldDefinitions || fieldDefinitions.length === 0) {
                    // Se non ci sono field definitions, inizia da 1
                    this.element.order_num = 1;
                } else {
                    // Calcola il massimo order_num
                    const maxOrderNum = Math.max(
                        ...fieldDefinitions
                            .map(fd => fd.order_num ?? 0)
                            .filter(num => num > 0)
                    );
                    // Preimposta il nuovo order_num come max + 1
                    this.element.order_num = maxOrderNum + 1;
                }
            },
            error => {
                // In caso di errore, inizia da 1
                console.error('Error loading field definitions for order_num calculation:', error);
                this.element.order_num = 1;
            }
        );
    }

    changedJoinMetadata(event: any) {
        const selected = event && event.value ? event.value as Metadata : null;
        this.selectedJoinMetadata = selected;
        this.joinFieldOptions = [];
        this.selectedJoinField = undefined;
        this.element.join_table_select_fields = '';

        if (!selected) {
            this.element.join_table_name = '';
            this.element.join_table_key = '';
            return;
        }

        this.element.join_table_name = selected.table_name;
        this.element.join_table_key = selected.table_key;
        this.loadJoinFields(selected.uuid);
    }

    changedJoinFields(event: any) {
        this.selectedJoinField = event && event.value ? String(event.value) : undefined;
        this.element.join_table_select_fields = this.selectedJoinField ?? '';
    }

    changedTab(event: any) {
        this.element.group_name = undefined;
        this.groups = this.tabToGroups.get(event.value) ?? [];
    }

    private splitTabsAndGroups(singleTabAndGroups: string) {
        const splittedTabGroups = singleTabAndGroups.split(':');
        // 1)tab1:group1,group2
        // 2)tab2
        if (!this.tabs) {
            this.tabs = [];
        }
        this.tabs.push({label: splittedTabGroups[0], value: splittedTabGroups[0]});
        if (splittedTabGroups.length > 1) {
            // caso tab1:group1,group2
            const groups = splittedTabGroups[1].split(',');
            const selectItemArray: SelectItem[] = [];
            for (const group of groups) {
                selectItemArray.push({label: group, value: group});
            }
            this.tabToGroups.set(splittedTabGroups[0], selectItemArray);
        }
    }

    next(uuid: string) {
        this.clearMsgs();
        this.editMode = false;
        this.preSave();
        this.service.persist(this.element).subscribe(element => {
                this.addInfo('Save completed successfully.');
                this.element = element;
                this.element = this.createInstance();
                this.element.metadata_uuid = uuid;
                this.fieldType = undefined;
                this.postCreate();

            },
            error => {
                this.addError(
                    'Unable to complete the save. ' + (error || '')
                );
                this.saveError();
            }
        );
    }

    update() {
        this.clearMsgs();
        this.editMode = false;
        if (!this.preUpdate()) {
            return;
        }
        this.service.update(this.element).subscribe(
            element => {
                this.addInfo('Update completed successfully.');
                this.element = <FieldDefinition>element;
                this.post();
            },
            error => {
                this.addError('Unable to complete the update. ' + (error || ''));
                this.saveError();
            }
        );
    }

    save() {
        this.clearMsgs();
        this.editMode = false;
        if (!this.preSave()) {
            return;
        }
        this.service.persist(this.element).subscribe(
            element => {
                this.addInfo('Save completed successfully.');
                this.element = <FieldDefinition>element;
                this.post();
            },
            error => {
                this.addError(
                    'Unable to complete the save. ' + (error || '')
                );
                this.saveError();
            }
        );
    }

    delete() {
        this.clearMsgs();
        this.editMode = false;
        this.service.delete(this.getId()).subscribe(
            element => {
                this.postDelete();
                this.post();
                this.addInfo('Deletion completed successfully.');
            },
            error => {
                this.addError(
                    'Unable to complete the deletion. ' + (error || '')
                );
            }
        );
    }

    post() {
        if (this.pageBack) {
            this.router.navigate([this.pageBack, this.uuidBack]);
        } else {
            if (this.isEditMode()) {
                super.navigateAfterUpdate();
            } else {
                super.navigateAfterSave();
            }

        }
    }

    navigateToList() {
        if (this.pageBack) {
            this.router.navigate([this.pageBack, this.uuidBack]);
        } else {
            this.router.navigate(['/' + this.path + '/list']);
        }
    }

    onNameChanged(newName: string) {
        if (!newName || newName.trim() === '') {
            this.enforceMandatoryForSlugKeyAddition();
            return;
        }
        // Trasforma snake_case in Title Case
        // Sostituisce underscore e dash con spazi, poi capitalizza la prima lettera di ogni parola
        const label = newName
            .replace(/[_-]+/g, ' ')  // Sostituisce underscore e dash con spazi
            .split(' ')               // Divide in parole
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalizza ogni parola
            .join(' ');               // Riunisce le parole
        
        this.element.label = label;
        this.enforceMandatoryForSlugKeyAddition();
    }

    private enforceMandatoryForSlugKeyAddition() {
        const metadata = this.selectedMetadata ?? this.mapMetadata.get(this.element.metadata_uuid);
        const fieldName = (this.element.name ?? '').trim();
        const tableKeyAddition = (metadata?.table_key_addition ?? '').trim();

        if (metadata?.table_key_type === 'slug' && fieldName !== '' && fieldName === tableKeyAddition) {
            this.element.mandatory = true;
        }
    }

    changedFieldType (event: any) {
        const key = event.value as keyof typeof this.componentDefaultValuesMapper;
        this.fieldType = key;
        this.syncSearchConditionItems();
        this.element.search_condition = this.componentDefaultValuesMapper[key] ?? '';
        if (key === 'join' || key === 'lookup' || key === 'multijoin' || key === 'multilookup') {
            this.initializeJoinMetadata();
        }
    }

    private syncSearchConditionItems() {
        if (this.fieldType === 'lookup' || this.fieldType === 'multilookup') {
            this.searchConditionItems = [...this.defaultSearchConditionItems];
            this.element.search_condition = '';
            return;
        }

        const isDateField = this.fieldType === 'date' || this.fieldType === 'datetime';
        this.searchConditionItems = isDateField
            ? [...this.dateSearchConditionItems]
            : [...this.defaultSearchConditionItems];

        const allowedValues = new Set(this.searchConditionItems.map(item => item.value));
        if (!allowedValues.has(this.element.search_condition ?? '')) {
            this.element.search_condition = this.componentDefaultValuesMapper[this.fieldType as keyof typeof this.componentDefaultValuesMapper] ?? '';
        }
    }

    private initializeJoinMetadata() {
        this.syncJoinFieldsFromElement();
        this.updateJoinMetadataOptions();
        this.selectedJoinMetadata = this.joinMetadatasSelect.find(
            metadata => metadata.table_name === this.element.join_table_name
        ) ?? null;

        if (this.selectedJoinMetadata) {
            this.element.join_table_name = this.selectedJoinMetadata.table_name;
            this.element.join_table_key = this.selectedJoinMetadata.table_key;
            this.loadJoinFields(this.selectedJoinMetadata.uuid, true);
        } else {
            this.joinFieldOptions = [];
        }
    }

    private syncJoinFieldsFromElement() {
        this.selectedJoinField = this.element.join_table_select_fields
            ? this.element.join_table_select_fields.split(',').map(field => field.trim()).filter(Boolean)[0]
            : undefined;
    }

    private loadJoinFields(metadataUuid: string, preserveSelection = false) {
        this.fieldDefinitionService.getAllList({
            name_contains: '',
            uuid: '',
            metadata_uuid: metadataUuid,
            _limit: 100000
        }).subscribe({
            next: (fieldDefinitions: FieldDefinition[]) => {
                this.joinFieldOptions = fieldDefinitions
                    .filter(fieldDefinition => !!fieldDefinition.name)
                    .map(fieldDefinition => ({
                        label: fieldDefinition.table_key
                            ? `${fieldDefinition.name} / key`
                            : `${fieldDefinition.name}`,
                        value: fieldDefinition.name
                    }))
                    .sort((left, right) => String(left.label).localeCompare(String(right.label), 'it'));

                if (preserveSelection) {
                    const allowedValues = new Set(this.joinFieldOptions.map(option => String(option.value)));
                    this.selectedJoinField = this.selectedJoinField && allowedValues.has(this.selectedJoinField)
                        ? this.selectedJoinField
                        : undefined;
                }

                if (!this.selectedJoinField && this.joinFieldOptions.length > 0) {
                    const firstField = this.joinFieldOptions[0].value;
                    this.selectedJoinField = firstField ? String(firstField) : undefined;
                }

                this.element.join_table_select_fields = this.selectedJoinField ?? '';
            },
            error: (error) => {
                this.joinFieldOptions = [];
                this.addError('Error while loading join fields ' + (error || ''));
            }
        });
    }

    private updateJoinMetadataOptions() {
        const currentMetadataUuid = this.selectedMetadata?.uuid || this.element.metadata_uuid;
        this.joinMetadatasSelect = this.metadatas
            .filter(
            metadata => metadata.uuid !== currentMetadataUuid
            )
            .sort((left, right) => left.table_name.localeCompare(right.table_name, 'it'));
    }
}
