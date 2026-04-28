import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../models/metadata';
import {NavigationExtras, Router} from '@angular/router';
import {MetadataService} from '../../services/metadata.service';
import {FieldDefinitionService} from '../../services/field-definition.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './metadata-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
export class MetadataListComponent extends AbstractListComponent<Metadata> implements OnInit {

    constructor(
        public  router: Router,
        public confirmationService: ConfirmationService,
        public service: MetadataService,
        public fieldDefinitionService: FieldDefinitionService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'metadata');
        this.filters = new Metadata();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    openExportPage() {
        this.router.navigate(['/metadata/export']);
    }

    openImportPage() {
        this.router.navigate(['/metadata/import']);
    }

    openWizardPage() {
        this.router.navigate(['/metadata/wizard']);
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    public addField(metadata: Metadata) {
        const navigationExtras: NavigationExtras = {
            queryParams: {'metadata_uuid': metadata.uuid}
        };
        this.router.navigate(['/fielddefinition/new'], navigationExtras);
        return false;
    }

    public createTable(metadata: Metadata) {
        this.fieldDefinitionService.getAllList({
            metadata_uuid: metadata.uuid,
            name_contains: '',
            uuid: '',
            _limit: 100000
        }).subscribe(
            fieldDefinitions => {
                if (!fieldDefinitions || fieldDefinitions.length === 0) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Unable to create metadata: at least one field definition is required.'
                    });
                    return;
                }

                if (metadata.table_key_type === 'slug') {
                    const tableKeyAddition = (metadata.table_key_addition ?? '').trim();
                    if (!tableKeyAddition) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Unable to create metadata: Table key Addition is required when table key type is slug.'
                        });
                        return;
                    }

                    const existsMatchingField = fieldDefinitions.some(fd => fd.name === tableKeyAddition);
                    if (!existsMatchingField) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Unable to create metadata: Table key Addition must match the name of an existing field definition.'
                        });
                        return;
                    }
                }

                this.service.createTable(metadata).subscribe(
                    res => {
                        this.reloadListData(metadata, res);
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Table created successfully.'
                        });
                    },
                    err => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error creating table.'
                        });
                    }
                );
            },
            () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error while validating field definitions.'
                });
            }
        );
    }

    public truncateTable(metadata: Metadata) {
        this.service.truncateTable(metadata.uuid).subscribe(
            res => {
                this.reloadListData(metadata, res);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Table truncated successfully.'
                });
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error truncating table.'
                });
            }
        );
    }

    public deleteTable(metadata: Metadata) {
        this.service.deleteTable(metadata.uuid).subscribe(
            res => {
                this.reloadListData(metadata, res);
                this.messageService.add({
                    severity: 'info',
                    summary: `Table '${metadata.table_name}' deleted successfully.`
                });
            },
            err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error deleting table.'
                });
            }
        );
    }

    public confirmTruncateTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.truncateTable(metadata);
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
                return this.truncateTable(metadata);
            }
        });
    }

    public confirmCreateTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.createTable(metadata);
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
                return this.createTable(metadata);
            }
        });
    }

    public confirmDeleteTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.deleteTable(metadata);
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
                return this.deleteTable(metadata);
            }
        });
    }

    private reloadListData(metadata: Metadata, element: Metadata) {
        metadata.created = element.created;
        metadata.already_exist = element.already_exist;
        metadata.table_name = element.table_name;
        metadata.description = element.description;
        metadata.table_key = element.table_key;
        metadata.alias_table = element.alias_table;
        metadata.order_by = element.order_by;
    }


    public view(element: Metadata) {
        this.element = element;
        this.router.navigate(['/' + this.path + '/view', this.getId()]);
    }

}
