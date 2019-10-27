import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Role} from '../../model/role';
import {RoleService} from '../../service/role.service';

@Component(
    {
        templateUrl: './role-list.component.html',
        styleUrls: ['./role-list.component.css']
    }
)
export class RoleListComponent extends AbstractListComponent<Role> implements OnInit {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: RoleService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'role');
        this.filters = new Role();
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

    getId(): any {
        return this.element['name'];
    }

}

