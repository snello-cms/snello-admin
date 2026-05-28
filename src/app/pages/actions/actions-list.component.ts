import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {Action} from '../../models/action';
import {ActionService} from '../../services/action.service';
import {ConfirmationService, MessageService, PrimeTemplate, SelectItem} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './actions-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, SelectModule, TableModule, PrimeTemplate]
})
export class ActionsListComponent extends AbstractListComponent<Action> implements OnInit {

    conditionItems: SelectItem[] = [
        {label: '', value: ''},
        {label: 'PERSIST', value: 'PERSIST'},
        {label: 'MERGE', value: 'MERGE'},
        {label: 'DELETE', value: 'DELETE'}
    ];

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: ActionService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'actions');
        this.filters = new Action();
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
}
