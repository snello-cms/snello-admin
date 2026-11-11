import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DatePipe} from '@angular/common';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ScheduledAction} from '../../models/scheduled-action';
import {ScheduledActionService} from '../../services/scheduled-action.service';
import {ConfirmationService, MessageService, PrimeTemplate, SelectItem} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './scheduled-actions-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, SelectModule, TableModule,
        PrimeTemplate, DatePipe]
})
export class ScheduledActionsListComponent extends AbstractListComponent<ScheduledAction> implements OnInit {

    enabledItems: SelectItem[] = [
        {label: '', value: ''},
        {label: 'Enabled', value: 'true'},
        {label: 'Disabled', value: 'false'}
    ];

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: ScheduledActionService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'scheduledactions');
        this.filters = new ScheduledAction();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    runNow(row: ScheduledAction) {
        console.log('[scheduled-actions] run now', row.uuid, row.name);
        this.service.runNow(row.uuid).subscribe({
            next: outcome => {
                Object.assign(row, outcome);
                const summary = `${row.name}: ${outcome.last_status} in ${outcome.last_duration_ms ?? 0} ms`;
                this.messageService.add({
                    severity: outcome.last_status === 'OK' ? 'success' : 'error',
                    summary,
                    detail: outcome.last_message || ''
                });
            },
            error: err => this.messageService.add({severity: 'error', summary: 'Run failed', detail: String(err?.message ?? err)})
        });
    }
}
