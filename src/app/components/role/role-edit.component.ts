import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {RoleService} from "../../service/role.service";
import {Role} from "../../model/role";
import {MetadataService} from "../../service/metadata.service";
import {SelectQueryService} from "../../service/select-query.service";
import {zip} from "rxjs";

@Component(
    {
        templateUrl: './role-edit.component.html',
        styleUrls: ['./role-edit.component.css']
    }
)
export class RoleEditComponent extends AbstractEditComponent<Role> implements OnInit {

    public metadatas: SelectItem[] = [];
    public queries: SelectItem[] = [];

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public metadataService: MetadataService,
        public selectQueryService: SelectQueryService,
        public confirmationService: ConfirmationService,
        public roleService: RoleService,
        public messageService: MessageService) {
        super(router, route, confirmationService, roleService, messageService, 'role');
    }

    public objectTypeSelect: SelectItem[] = [
        {value: 'metadatas', label: 'metadatas'},
        {value: 'query', label: 'query'}
    ];

    public actionSelect: SelectItem[] = [
        {value: 'view', label: 'view'},
        {value: 'edit', label: 'edit'}
    ];

    ngOnInit() {
        this.element = new Role();
        super.ngOnInit();
        let metadatas = this.metadataService.getList();
        let queries = this.selectQueryService.getList();
        zip(metadatas, queries).subscribe(
            val => {
                if (val[0] && val[0].length > 0) {
                    for (let meta of val[0]) {
                        this.metadatas.push({label: meta.table_name, value: meta.table_name});
                    }
                }
                if (val[1] && val[1].length > 0) {
                    for (let query of val[1]) {
                        this.queries.push({label: query.query_name, value: query.query_name});
                    }
                }
            });
    }

    createInstance(): Role {
        return new Role();
    }

    postFind() {
        this.element.uuid_name = this.element.name;
    }


    preUpdate(): boolean {
        delete this.element.uuid_name;
        return true;
    }

    resetName() {
        if (this.element) {
            this.element.name = '';
            this.element.description = '';
        }
    }

    changedMetadata() {
        console.log('name: ' + this.element.object_name);
        console.log('action: ' + this.element.action);
        this.element.name = (this.element.object_name ? this.element.object_name : '') + '_' + (this.element.action ? this.element.action : '');
        this.element.description = (this.element.object_name ? this.element.object_name : '') + ' ' + (this.element.action ? this.element.action : '');
    }


    getId(): any {
        return this.element.name;
    }

}

