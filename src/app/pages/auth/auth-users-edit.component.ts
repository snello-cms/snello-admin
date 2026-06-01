import {Component, OnInit, inject} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AuthUserService} from '../../services/auth-user.service';
import {AuthUser} from '../../models/auth-user';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {CheckboxModule} from 'primeng/checkbox';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AuthGroup} from '../../models/auth-group';

@Component({
    standalone: true,
    templateUrl: './auth-users-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, CheckboxModule, RouterLink]
})
export class AuthUsersEditComponent extends AbstractEditComponent<AuthUser> implements OnInit {

    groupNamesCsv = '';
    availableGroups: AuthGroup[] = [];
    editAll = false;
    viewAll = false;
    all = false;

    private readonly authUserService = inject(AuthUserService);

    constructor() {
        super(
            inject(Router),
            inject(ActivatedRoute),
            inject(ConfirmationService),
            inject(AuthUserService),
            inject(MessageService),
            'auth-users'
        );
    }

    createInstance(): AuthUser {
        return new AuthUser();
    }

    ngOnInit() {
        this.element = new AuthUser();
        this.loadAvailableGroups();
        super.ngOnInit();
    }

    postCreate() {
        this.element.groupNames = [];
        this.element.enabled = true;
        this.element.emailVerified = false;
        this.syncGroupNamesCsvFromElement();
        this.updateMasterFlags();
    }

    override postFind() {
        this.authUserService.userGroups(this.element.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            groups => {
                this.element.groupNames = (groups || []).map(group => group.name);
                this.syncGroupNamesCsvFromElement();
                this.updateMasterFlags();
            },
            () => {
                this.element.groupNames = this.element.groupNames || [];
                this.syncGroupNamesCsvFromElement();
                this.updateMasterFlags();
            }
        );
    }

    override preSave(): boolean {
        this.syncElementGroupNamesFromCsv();
        return true;
    }

    override preUpdate(): boolean {
        this.syncElementGroupNamesFromCsv();
        return true;
    }

    private syncGroupNamesCsvFromElement() {
        this.groupNamesCsv = (this.element.groupNames || []).join(', ');
    }

    private syncElementGroupNamesFromCsv() {
        this.element.groupNames = (this.groupNamesCsv || '')
            .split(',')
            .map(name => name.trim())
            .filter(name => !!name);
    }

    isGroupSelected(groupName: string): boolean {
        const groupNames = this.element.groupNames || [];
        return groupNames.includes(groupName);
    }

    onGroupSelectionChange(groupName: string, checked: boolean) {
        const groupNames = this.element.groupNames || [];
        if (checked && !groupNames.includes(groupName)) {
            groupNames.push(groupName);
        }
        if (!checked) {
            this.element.groupNames = groupNames.filter(name => name !== groupName);
        } else {
            this.element.groupNames = groupNames;
        }
        this.syncGroupNamesCsvFromElement();
        this.updateMasterFlags();
    }

    onEditAllChange(checked: boolean) {
        this.toggleGroupsBySuffix('_edit', checked);
    }

    onViewAllChange(checked: boolean) {
        this.toggleGroupsBySuffix('_view', checked);
    }

    onAllChange(checked: boolean) {
        const allGroupNames = this.availableGroups.map(group => group.name);
        this.element.groupNames = checked ? [...allGroupNames] : [];
        this.syncGroupNamesCsvFromElement();
        this.updateMasterFlags();
    }

    private loadAvailableGroups() {
        this.authUserService.listGroups().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            groups => {
                this.availableGroups = this.sortGroups(groups || []);
                this.updateMasterFlags();
            },
            () => {
                this.availableGroups = [];
                this.updateMasterFlags();
            }
        );
    }

    private sortGroups(groups: AuthGroup[]): AuthGroup[] {
        return [...groups].sort((a, b) => {
            const priorityA = this.getGroupPriority(a.name);
            const priorityB = this.getGroupPriority(b.name);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            return a.name.localeCompare(b.name);
        });
    }

    private getGroupPriority(name: string): number {
        const loweredName = (name || '').toLowerCase();
        if (loweredName.endsWith('_edit')) {
            return 0;
        }
        if (loweredName.endsWith('_view')) {
            return 1;
        }
        return 2;
    }

    private toggleGroupsBySuffix(suffix: string, checked: boolean) {
        const targetNames = this.availableGroups
            .map(group => group.name)
            .filter(name => name.toLowerCase().endsWith(suffix));
        const selectedNames = new Set(this.element.groupNames || []);

        if (checked) {
            targetNames.forEach(name => selectedNames.add(name));
        } else {
            targetNames.forEach(name => selectedNames.delete(name));
        }

        this.element.groupNames = Array.from(selectedNames);
        this.syncGroupNamesCsvFromElement();
        this.updateMasterFlags();
    }

    private updateMasterFlags() {
        const selectedNames = new Set(this.element.groupNames || []);
        const allNames = this.availableGroups.map(group => group.name);
        const editNames = allNames.filter(name => name.toLowerCase().endsWith('_edit'));
        const viewNames = allNames.filter(name => name.toLowerCase().endsWith('_view'));

        this.editAll = editNames.length > 0 && editNames.every(name => selectedNames.has(name));
        this.viewAll = viewNames.length > 0 && viewNames.every(name => selectedNames.has(name));
        this.all = allNames.length > 0 && allNames.every(name => selectedNames.has(name));
    }
}
