import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {FieldDefinitionService} from '../../service/field-definition.service';
import {FieldDefinition} from '../../model/field-definition';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';

@Component(
    {
        templateUrl: './field-definition-list.component.html',
        styleUrls: ['./field-definition-list.component.css']
    }
)
export class FieldDefinitionListComponent extends AbstractListComponent<FieldDefinition> implements OnInit {

    public metadatasItems: SelectItem[];
    metadatas: Map<string, boolean> = new Map<string, boolean>();

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: FieldDefinitionService,
        public metadataService: MetadataService,
        public messageService: MessageService) {
        super(messageService, router, confirmationService, service, 'fielddefinition');
        this.filters = new FieldDefinition();

        this.metadatasItems = [];
        this.metadataService.buildSearch();
        this.metadataService.getAllList().subscribe(metadatas => {
            this.metadatasItems.push({label: null, value: '...'});
            for (let p = 0; p < metadatas.length; p++) {
                this.metadatas.set(metadatas[p].uuid, metadatas[p].created);
                this.metadatasItems.push({
                    label: metadatas[p].table_name,
                    value: metadatas[p].uuid
                });
            }
        });
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    postList() {
        super.postList();
    }

    public isEditable(fieldDefinition: FieldDefinition): boolean {
        if (!this.metadatas.has(fieldDefinition.metadata_uuid)) {
            return true;
        }
        return !this.metadatas.get(fieldDefinition.metadata_uuid);
    }
}
