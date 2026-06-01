import {Component, OnInit, inject} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AuthGroupService} from '../../services/auth-group.service';
import {AuthGroup} from '../../models/auth-group';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';

@Component({
    standalone: true,
    templateUrl: './auth-groups-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, RouterLink]
})
export class AuthGroupsEditComponent extends AbstractEditComponent<AuthGroup> implements OnInit {

    constructor() {
        super(
            inject(Router),
            inject(ActivatedRoute),
            inject(ConfirmationService),
            inject(AuthGroupService),
            inject(MessageService),
            'auth-groups'
        );
    }

    createInstance(): AuthGroup {
        return new AuthGroup();
    }

    ngOnInit() {
        this.element = new AuthGroup();
        super.ngOnInit();
    }
}
