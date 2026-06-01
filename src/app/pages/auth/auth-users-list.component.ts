import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router, RouterLink} from '@angular/router';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {AuthUser} from '../../models/auth-user';
import {AuthUserService} from '../../services/auth-user.service';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './auth-users-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate, RouterLink]
})
export class AuthUsersListComponent extends AbstractListComponent<AuthUser> implements OnInit {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AuthUserService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'auth-users');
        this.filters = new AuthUser();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/auth-users/new']);
    }

    override getId(): string {
        return this.element.id;
    }

    postList() {
        super.postList();
    }
}
