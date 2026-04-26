import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../models/metadata';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {MetadataService} from '../../services/metadata.service';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {FieldDefinitionService} from '../../services/field-definition.service';
import {FieldDefinition} from '../../models/field-definition';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { TableModule } from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './metadata-view.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, TableModule, PrimeTemplate]
})
export class MetadataViewComponent extends AbstractViewComponent<Metadata>
    implements OnInit {

    public fieldDefinitions: FieldDefinition[];
    public colspan = 3;
    public activeTab: 'metadata' | 'fieldDefinitions' = 'metadata';

    constructor(
        router: Router,
        route: ActivatedRoute,
        public metadataService: MetadataService,
        public confirmationService: ConfirmationService,
        protected messageService: MessageService,
        public fieldDefinitionService: FieldDefinitionService
    ) {
        super(router, route, metadataService, messageService, 'metadata');
        this.element = new Metadata();
    }

    createInstance(): Metadata {
        return new Metadata();
    }

    ngOnInit() {
        this.element = new Metadata();
        super.ngOnInit();
    }

    public selectTab(tab: 'metadata' | 'fieldDefinitions', event?: Event) {
        event?.preventDefault();
        this.activeTab = tab;
    }

    getId() {
        return this.element.uuid;
    }

    postFind() {
        super.postFind();
        this.fieldDefinitionService.buildSearch();
        this.fieldDefinitionService.search.metadata_uuid = this.element.uuid;
        this.fieldDefinitionService.getAllList().subscribe(
            fieldDefinitions => {
                this.fieldDefinitions = fieldDefinitions.sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));
            });
    }

    public edit() {
        this.router.navigate(['/' + this.path + '/edit', this.getId()]);
    }

    public createTable() {
        this.fieldDefinitionService.getAllList({
            metadata_uuid: this.element.uuid,
            name_contains: '',
            uuid: '',
            _limit: 100000
        }).subscribe(
            fieldDefinitions => {
                if (!fieldDefinitions || fieldDefinitions.length === 0) {
                    this.addError('Unable to create metadata: at least one field definition is required.');
                    return;
                }

                if (this.element.table_key_type === 'slug') {
                    const tableKeyAddition = (this.element.table_key_addition ?? '').trim();
                    if (!tableKeyAddition) {
                        this.addError('Unable to create metadata: Table key Addition is required when table key type is slug.');
                        return;
                    }

                    const existsMatchingField = fieldDefinitions.some(fd => fd.name === tableKeyAddition);
                    if (!existsMatchingField) {
                        this.addError('Unable to create metadata: Table key Addition must match the name of an existing field definition.');
                        return;
                    }
                }

                this.metadataService.createTable(this.element).subscribe(
                    res => {
                        this.addInfo('Table created successfully.');
                        if (res && typeof res === 'object' && res.body) {
                            this.element = res.body;
                        } else {
                            this.element = res;
                        }
                    },
                    err => {
                        this.addError('Error creating table.');
                    }
                );
            },
            () => {
                this.addError('Error while validating field definitions.');
            }
        );
    }

    public truncateTable() {
        this.metadataService.truncateTable(this.element.uuid).subscribe(
            res => {
                this.addInfo('Table truncated successfully.');
                if (res && typeof res === 'object' && res.body) {
                    this.element = res.body;
                } else {
                    this.element = res;
                }
            },
            err => {
                this.addError('Error truncating table.');
            }
        );
    }

    public deleteTable() {
        this.metadataService.deleteTable(this.element.uuid).subscribe(
            res => {
                this.addInfo('Table deleted successfully.');
                if (res && typeof res === 'object' && res.body) {
                    this.element = res.body;
                } else {
                    this.element = res;
                }
            },
            err => {
                this.addError('Error deleting table.');
            }
        );
    }

    public confirmTruncateTable() {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.truncateTable();
        }
        this.confirmationService.confirm({
            message: 'do you really want to truncate this table?',
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
                return this.truncateTable();
            }
        });
    }

    public confirmCreateTable() {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.createTable();
        }
        this.confirmationService.confirm({
            message: 'do you really want to create this table',
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
                return this.createTable();
            }
        });
    }

    public confirmDeleteTable() {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.deleteTable();
        }
        this.confirmationService.confirm({
            message: 'do you really want to delete this table',
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
                return this.deleteTable();
            }
        });
    }


    public editField(fieldDefinition: FieldDefinition) {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                'pageBack': '/' + this.path + '/view',
                'uuidBack': this.element.uuid
            }
        };
        this.router.navigate(['/fielddefinition/edit', fieldDefinition.uuid], navigationExtras);
    }

    newFieldDefinition() {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                'metadata_uuid': this.element.uuid,
                'pageBack': '/' + this.path + '/view',
                'uuidBack': this.element.uuid
            }
        };
        this.router.navigate(['/fielddefinition/new'], navigationExtras);
    }

    changeFieldDefinitionsOrder() {
        this.router.navigate(['/metadata/change-order', this.element.uuid]);
    }

}
