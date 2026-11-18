import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {WorkflowPage} from '../../models/workflow-page';
import {WorkflowPageService} from '../../services/workflow-page.service';

@Component({
    standalone: true,
    templateUrl: './workflow-pages-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
export class WorkflowPagesListComponent extends AbstractListComponent<WorkflowPage> implements OnInit {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: WorkflowPageService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'workflowpages');
        this.filters = new WorkflowPage();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }
}
