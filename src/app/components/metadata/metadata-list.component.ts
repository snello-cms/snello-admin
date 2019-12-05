import {ConfirmationService, MessageService} from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../model/metadata';
import {NavigationExtras, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';

@Component(
    {
        templateUrl: './metadata-list.component.html',
        styleUrls: ['./metadata-list.component.css']
    }
)
export class MetadataListComponent extends AbstractListComponent<Metadata> implements OnInit {

    constructor(
        public  router: Router,
        public confirmationService: ConfirmationService,
        public service: MetadataService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'metadata');
        this.filters = new Metadata();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
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
        this.service.createTable(metadata).subscribe(
            element => {
                console.log();
                this.reloadListData(metadata, element);
                this.messageService.add({
                    severity: 'info',
                    summary: 'table created: ' + element
                });
            });
    }

    public truncateTable(metadata: Metadata) {
        this.service.truncateTable(metadata.uuid).subscribe(
            element => {
                this.reloadListData(metadata, element);
                this.messageService.add({
                    severity: 'info',
                    summary: 'table truncated: ' + element
                });
            });
    }

    public deleteTable(metadata: Metadata) {
        this.service.deleteTable(metadata.uuid).subscribe(
            element => {
                console.log('table deleted: ' + element);
                this.reloadListData(metadata, element);
                this.messageService.add({
                    severity: 'info',
                    summary: 'table deleted: ' + element
                });
            });
    }

    public confirmTruncateTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.truncateTable(metadata);
        }
        this.confirmationService.confirm({
            message: 'do you really want to truncate this table?',
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
