import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {forkJoin, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {FlowService} from '../../services/flow.service';
import {FlowDefinition} from '../../models/flow-definition';
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
        public messageService: MessageService,
        private flow: FlowService,
        private cd: ChangeDetectorRef
    ) {
        super(messageService, router, confirmationService, service, 'workflowdefinitions');
        this.filters = new WorkflowDefinition();
    }

    /** Loaded on the runner but not written here: the git-managed workflows (k8s init container -> workflows folder). */
    runnerOnly: FlowDefinition[] = [];
    runnerError: string | null = null;

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
        this.loadRunnerOnly();
    }

    loadRunnerOnly() {
        forkJoin({
            loaded: this.flow.definitions(),
            managed: this.service.getAllList({}).pipe(catchError(() => of([] as WorkflowDefinition[])))
        }).subscribe({
            next: ({loaded, managed}) => {
                const here = new Set((managed ?? []).map(w => `${w.namespace}:${w.name}:${w.version}`));
                this.runnerOnly = (loaded ?? [])
                    .filter(d => !here.has(`${d.namespace}:${d.name}:${d.version}`))
                    .sort((a, b) => `${a.namespace}:${a.name}:${a.version}`.localeCompare(`${b.namespace}:${b.name}:${b.version}`));
                this.runnerError = null;
                console.log('[workflows] runner loaded', loaded?.length, 'managed here', here.size, '-> from git', this.runnerOnly.length);
                this.cd.markForCheck();
            },
            error: e => {
                this.runnerError = e?.error?.error || e?.message || 'runner not reachable';
                console.warn('[workflows] runner workflows not available', e);
                this.cd.markForCheck();
            }
        });
    }

    openRunner(d: FlowDefinition) {
        this.router.navigate(['/workflowdefinitions/runner', d.namespace, d.name, d.version]);
    }

    monitor(d: FlowDefinition) {
        this.router.navigate(['/flowmonitor/list'], {queryParams: {wf: `${d.namespace}:${d.name}:${d.version}`}});
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }
}
