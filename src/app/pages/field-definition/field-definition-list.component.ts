import {Component, OnInit, inject} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldDefinitionService} from '../../services/field-definition.service';
import {FieldDefinition} from '../../models/field-definition';
import {MetadataService} from '../../services/metadata.service';
import { ConfirmationService, MessageService, SelectItem, PrimeTemplate } from 'primeng/api';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import {MAP_INPUT_TO_FIELD} from '../../constants/constants';

@Component({
    standalone: true,
    templateUrl: './field-definition-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, SelectModule, TableModule, PrimeTemplate]
})
export class FieldDefinitionListComponent extends AbstractListComponent<FieldDefinition> implements OnInit {

    public metadatasItems: SelectItem[];
    metadatas: Map<string, boolean> = new Map<string, boolean>();
    private mapFieldToType: Map<string, string> = new Map<string, string>();
    private readonly route = inject(ActivatedRoute);

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
            this.metadatasItems.push({label: '', value: '...'});
            for (let p = 0; p < metadatas.length; p++) {
                this.metadatas.set(metadatas[p].uuid, metadatas[p].created);
                this.metadatasItems.push({
                    label: metadatas[p].table_name,
                    value: metadatas[p].uuid
                });
            }
        });

        for (const key of Array.from(MAP_INPUT_TO_FIELD.keys())) {
            const fieldDefType = MAP_INPUT_TO_FIELD.get(key);
            if (fieldDefType) {
                this.mapFieldToType.set(this.buildFieldTypeKey(fieldDefType[0], fieldDefType[1]), key);
            }
        }
    }

    ngOnInit() {
        this.service.buildSearch();
        const metadataUuid = this.route.snapshot.queryParamMap.get('metadata_uuid');
        if (metadataUuid) {
            this.service.search.metadata_uuid = metadataUuid;
        }
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

    getDisplayInputType(fieldDefinition: FieldDefinition): string {
        const mapped = this.mapFieldToType.get(this.buildFieldTypeKey(fieldDefinition.type, fieldDefinition.input_type));
        if (mapped) {
            return mapped;
        }

        if (fieldDefinition.input_type) {
            return fieldDefinition.input_type;
        }

        return fieldDefinition.type;
    }

    private buildFieldTypeKey(type?: string, inputType?: string | null): string {
        return `${type ?? ''}::${inputType ?? ''}`;
    }
}
