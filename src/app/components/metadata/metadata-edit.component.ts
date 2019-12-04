import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {Metadata} from '../../model/metadata';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {FONT_AWESOME_ICONS} from '../../constants/constants';

@Component({
    templateUrl: './metadata-edit.component.html',
    styleUrls: ['./metadata-edit.component.css']
})
export class MetadataEditComponent extends AbstractEditComponent<Metadata>
    implements OnInit {

    tableTypeSelect: SelectItem[] = [
        {value: 'uuid', label: 'uuid'},
        {value: 'slug', label: 'slug'},
        {value: 'autoincrement', label: 'auto increment'}
    ];

    public newtable = true;
    public advanced = false;

    constructor(
        router: Router,
        route: ActivatedRoute,
        confirmationService: ConfirmationService,
        metadataService: MetadataService,
        public messageService: MessageService,
    ) {
        super(router, route, confirmationService, metadataService, messageService, 'metadata');
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
        if (this.element.uuid) {
            this.newtable = this.element.already_exist;
        } else {
            this.element.table_key = 'uuid';
            this.element.table_key_type = 'uuid';
        }
    }

    preSave(): boolean {
        this.element.already_exist = !this.newtable;
        return true;
    }

    preUpdate(): boolean {
        this.element.already_exist = !this.newtable;
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
                this.addInfo('Salvataggio completato con successo. ');
                this.element = <Metadata>element;
                this.postSave();
                this.navigateAfterSaveOrUpdate();
            },
            error => {
                this.addError(
                    'Impossibile completare il salvataggio. ' + (error || '')
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
        console.log(JSON.stringify(this.element));
        this.clearMsgs();
        this.editMode = false;
        if (!this.preUpdate()) {
            return;
        }
        this.service.update(this.element).subscribe(
            element => {
                this.addInfo('Modify completata con successo. ');
                this.element = <Metadata>element;
                this.postUpdate();
                this.navigateAfterSaveOrUpdate();
            },
            error => {
                this.addError('Impossibile completare la Modify. ' + (error || ''));
                this.saveError();
            }
        );
    }


}
