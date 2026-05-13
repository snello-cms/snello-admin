import {Component, OnInit, inject} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {Metadata} from '../../models/metadata';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../services/metadata.service';
import { ConfirmationService, MessageService, SelectItem, PrimeTemplate } from 'primeng/api';
import {FONT_AWESOME_ICONS} from '../../constants/constants';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AutoComplete } from 'primeng/autocomplete';

@Component({
    standalone: true,
    templateUrl: './metadata-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, SelectModule, PrimeTemplate, ToggleSwitchModule, AutoComplete]
})
export class MetadataEditComponent extends AbstractEditComponent<Metadata>
    implements OnInit {

    private metadataService = inject(MetadataService);

    tableTypeSelect: SelectItem[] = [
        {value: 'uuid', label: 'uuid'},
        {value: 'slug', label: 'slug'},
        {value: 'autoincrement', label: 'auto increment'},
        {value: 'userdefined', label: 'user defined'}
    ];

    public newtable = true;
    public advanced = false;
    public api_protected = false;
    metadataGroups: string[] = [];
    filteredMetadataGroups: string[] = [];

    constructor() {
        super(inject(Router), inject(ActivatedRoute), inject(ConfirmationService), inject(MetadataService), inject(MessageService), 'metadata');
    }

    iconItems: SelectItem[] = FONT_AWESOME_ICONS;

    createInstance(): Metadata {
        return new Metadata();
    }


    postCreate() {
        this.element.icon = FONT_AWESOME_ICONS[0].value;
        super.postCreate();
    }

    ngOnInit() {
        this.element = new Metadata();
        super.ngOnInit();
        this.loadMetadataGroups();
        if (this.element.uuid) {
            this.newtable = this.element.already_exist;
            this.api_protected = !!this.element.api_protected;
        } else {
            this.element.table_key = 'uuid';
            this.element.table_key_type = 'uuid';
        }
    }

    filterMetadataGroups(event: { query?: string }) {
        const query = (event?.query ?? '').toLowerCase();
        this.filteredMetadataGroups = this.metadataGroups.filter(group => group.toLowerCase().includes(query));
    }

    private loadMetadataGroups() {
        this.metadataService.getMetadataGroups().subscribe(groups => {
            const normalized = (groups ?? [])
                .map(group => group.trim())
                .filter(Boolean);
            this.metadataGroups = [...new Set(normalized)]
                .sort((left, right) => left.localeCompare(right, 'it'));
            this.filteredMetadataGroups = [...this.metadataGroups];
        });
    }

    preSave(): boolean {
        this.element.api_protected = this.api_protected;
        this.element.already_exist = !this.newtable;
        this.element.metadata_group = (this.element.metadata_group ?? '').trim();
        return true;
    }

    preUpdate(): boolean {
        this.element.api_protected = this.api_protected;
        this.element.already_exist = !this.newtable;
        this.element.metadata_group = (this.element.metadata_group ?? '').trim();
        return true;
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
                this.element = <Metadata>element;
                this.postSave();
                this.navigateAfterSaveOrUpdate();
            },
            error => {
                this.addError(
                    'Unable to complete the save. ' + (error || '')
                );
                this.saveError();
            }
        );
    }

    navigateAfterSaveOrUpdate() {
        if (this.path) {
            this.router.navigate(['/' + this.path + '/view', this.element.uuid]);
        } else {
            this.router.navigate(['/']);
        }
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
                this.element = <Metadata>element;
                this.postUpdate();
                this.navigateAfterSaveOrUpdate();
            },
            error => {
                this.addError('Unable to complete the update. ' + (error || ''));
                this.saveError();
            }
        );
    }

}
