import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {Condition} from '../../model/condtion';
import {ConfirmationService, MessageService} from 'primeng/api';
import {User} from '../../model/user';
import {UserService} from '../../service/user.service';

@Component(
    {
        templateUrl: './user-list.component.html',
        styleUrls: ['./user-list.component.css']
    }
)
export class UserListComponent extends AbstractListComponent<User> implements OnInit {
    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: UserService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'user');
        this.filters = new Condition();
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
        return this.element['username'];
    }

}

