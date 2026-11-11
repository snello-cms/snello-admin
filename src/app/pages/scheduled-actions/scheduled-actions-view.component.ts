import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ScheduledAction} from '../../models/scheduled-action';
import {ScheduledActionService} from '../../services/scheduled-action.service';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';

@Component({
    standalone: true,
    templateUrl: './scheduled-actions-view.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, DatePipe]
})
export class ScheduledActionsViewComponent extends AbstractViewComponent<ScheduledAction> implements OnInit {

    constructor(
        router: Router,
        route: ActivatedRoute,
        public scheduledActionService: ScheduledActionService,
        public confirmationService: ConfirmationService,
        protected messageService: MessageService
    ) {
        super(router, route, scheduledActionService, messageService, 'scheduledactions');
        this.element = new ScheduledAction();
    }

    createInstance(): ScheduledAction {
        return new ScheduledAction();
    }

    ngOnInit() {
        this.element = new ScheduledAction();
        super.ngOnInit();
    }

    getId(): string {
        return this.element.uuid;
    }

    public edit() {
        this.router.navigate(['/' + this.path + '/edit', this.getId()]);
    }
}
