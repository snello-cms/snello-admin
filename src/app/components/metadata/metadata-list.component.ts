import {ConfirmationService} from 'primeng/api';
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
        public service: MetadataService) {

        super(router, confirmationService, service, 'metadata');
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
                console.log('table created: ' + element);
                this.reloadListData(metadata, element);
            });
    }

    public truncateTable(metadata: Metadata) {
        this.service.truncateTable(metadata.uuid).subscribe(
            element => {
                console.log('table truncated: ' + element);
                this.reloadListData(metadata, element);
            });
    }

    public deleteTable(metadata: Metadata) {
        this.service.deleteTable(metadata.uuid).subscribe(
            element => {
                console.log('table deleted: ' + element);
                this.reloadListData(metadata, element);
            });
    }

    public confirmTruncateTable(metadata: Metadata) {
        this.clearMsgs();
        if (!this.confirmationService) {
            return this.truncateTable(metadata);
        }
        this.confirmationService.confirm({
            message: 'Confermi la truncate table?',
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
            message: 'Confermi la create table?',
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
            message: 'Confermi la delete table?',
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
