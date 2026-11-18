import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DatePipe, LowerCasePipe} from '@angular/common';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {WorkflowDefinition} from '../../models/workflow-definition';
import {WorkflowDefinitionService} from '../../services/workflow-definition.service';

@Component({
    standalone: true,
    templateUrl: './workflow-definitions-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './workflow-status.css',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate, DatePipe, LowerCasePipe]
})
export class WorkflowDefinitionsListComponent extends AbstractListComponent<WorkflowDefinition> implements OnInit {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: WorkflowDefinitionService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'workflowdefinitions');
        this.filters = new WorkflowDefinition();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }
}
