import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {Condition} from '../../model/condtion';
import {ConditionService} from '../../service/condition.service';
import {MetadataService} from '../../service/metadata.service';
import {Metadata} from '../../model/metadata';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';

@Component(
    {
        templateUrl: './condition-edit.component.html',
        styleUrls: ['./condition-edit.component.css']
    }
)
export class ConditionEditComponent extends AbstractEditComponent<Condition> implements OnInit {

    metadatas = [];
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
        this.element.metadata_name = this.mapMetadata.get(this.element.metadata_uuid).table_name;
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

