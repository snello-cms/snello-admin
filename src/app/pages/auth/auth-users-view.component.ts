import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MessageService} from 'primeng/api';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {AuthUser} from '../../models/auth-user';
import {AuthUserService} from '../../services/auth-user.service';
import {AuthGroup} from '../../models/auth-group';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';

@Component({
    standalone: true,
    templateUrl: './auth-users-view.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, RouterLink]
})
export class AuthUsersViewComponent extends AbstractViewComponent<AuthUser> implements OnInit {

    userGroups: AuthGroup[] = [];

    constructor() {
        super(
            inject(Router),
            inject(ActivatedRoute),
            inject(AuthUserService),
            inject(MessageService),
            'auth-users'
        );
        this.element = new AuthUser();
    }

    override ngOnInit() {
        this.element = new AuthUser();
        super.ngOnInit();
    }

    override postFind() {
        this.loadUserGroups();
    }

    getId(): string {
        return this.element.id;
    }

    private loadUserGroups() {
        const authUserService = this.service as AuthUserService;
        authUserService.userGroups(this.element.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            groups => {
                this.userGroups = groups || [];
            },
            () => {
                this.userGroups = [];
                this.addError('Unable to load user groups.');
            }
        );
    }
}
