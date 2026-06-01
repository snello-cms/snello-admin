import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router, RouterLink} from '@angular/router';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {AuthGroup} from '../../models/auth-group';
import {AuthGroupService} from '../../services/auth-group.service';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AuthUser} from '../../models/auth-user';

@Component({
    standalone: true,
    templateUrl: './auth-groups-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate, RouterLink]
})
export class AuthGroupsListComponent extends AbstractListComponent<AuthGroup> implements OnInit {

    selectedGroupUsers: AuthUser[] = [];
    selectedGroupName = '';

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AuthGroupService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'auth-groups');
        this.filters = new AuthGroup();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public verifyGroups() {
        this.clearMsgs();
        this.service.verifyGroups().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            () => {
                this.addInfo('Groups verification completed successfully.');
            },
            () => {
                this.addError('Unable to verify groups. Please try again.');
            }
        );
    }

    public users(group: AuthGroup) {
        this.clearMsgs();
        this.selectedGroupName = group.name;
        this.service.groupUsers(group.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            users => {
                this.selectedGroupUsers = users || [];
                if (this.selectedGroupUsers.length === 0) {
                    this.addWarn('No users assigned to this group.');
                }
            },
            () => {
                this.selectedGroupUsers = [];
                this.addError('Unable to load group users. Please try again.');
            }
        );
    }

    public viewUser(user: AuthUser) {
        this.router.navigate(['/auth-users/view', user.id]);
    }

    public editUser(user: AuthUser) {
        this.router.navigate(['/auth-users/edit', user.id]);
    }

    postList() {
        super.postList();
    }
}
