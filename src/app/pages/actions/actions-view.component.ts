import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Action} from '../../models/action';
import {ActionService} from '../../services/action.service';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';

@Component({
    standalone: true,
    templateUrl: './actions-view.component.html',
    imports: [SideBarComponent, AdminhomeTopBar]
})
export class ActionsViewComponent extends AbstractViewComponent<Action> implements OnInit {

    constructor(
        router: Router,
        route: ActivatedRoute,
        public actionService: ActionService,
        public confirmationService: ConfirmationService,
        protected messageService: MessageService
    ) {
        super(router, route, actionService, messageService, 'actions');
        this.element = new Action();
    }

    createInstance(): Action {
        return new Action();
    }

    ngOnInit() {
        this.element = new Action();
        super.ngOnInit();
    }

    getId(): string {
        return this.element.uuid;
    }

    public edit() {
        this.router.navigate(['/' + this.path + '/edit', this.getId()]);
    }
}
