import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {Condition} from '../../model/condtion';
import {ConditionService} from '../../service/condition.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputText } from 'primeng/inputtext';

@Component({
    templateUrl: './condition-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, SelectModule, InputText]
})
export class ConditionEditComponent extends AbstractEditComponent<Condition> implements OnInit {

    metadatas: Metadata[] = [];
    metadatasSelect: SelectItem[] = [];
    mapMetadata: Map<string, Metadata> = new Map();

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public conditionService: ConditionService,
        public messageService: MessageService,
        public metadataService: MetadataService,
    ) {
        super(router, route, confirmationService, conditionService, messageService, 'condition');

    }

    ngOnInit() {
        this.element = new Condition();
        this.metadatas = [];
        this.metadataService.getList().subscribe(
            metadataList => {
                this.valorizeMetadatas(metadataList);
            }
        );
        super.ngOnInit();
    }

    valorizeMetadatas(metadataList: Metadata[]) {
        this.metadatas = metadataList;
        for (const meta of this.metadatas) {
            this.metadatasSelect.push({value: meta.uuid, label: meta.table_name});
            this.mapMetadata.set(meta.uuid, meta);
        }
    }

    pre() {
        const metadata = this.mapMetadata.get(this.element.metadata_uuid);
        if (metadata) {
            this.element.metadata_name = metadata.table_name;
        }
    }

    preSave(): boolean {
        this.pre();
        return super.preSave();
    }


    preUpdate(): boolean {
        this.pre();
        return super.preUpdate();
    }


    createInstance(): Condition {
        return new Condition();
    }

    setName(event: any, metadata: Metadata) {
        this.element.metadata_name = metadata.table_name;
    }
}

