import {Component, OnInit, ChangeDetectionStrategy, inject} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';
import {SelectModule} from 'primeng/select';
import {WorkflowDefinitionService} from '../../services/workflow-definition.service';
import {WorkflowDefinition} from '../../models/workflow-definition';
import {WorkflowPage} from '../../models/workflow-page';
import {WorkflowPageService} from '../../services/workflow-page.service';
import {ConfigurationService} from '../../services/configuration.service';
import {API_SERVICE_PATH} from '../../constants/constants';

/** Starter body: shows the whole record, then the decision bar. Everything here runs in the viewer's browser. */
const STARTER = `<div class="sp-wrap">
  <h1 class="sp-h1" id="title">Loading…</h1>
  <div class="sp-card" id="summary"></div>
  <!-- the decision bar (status, comment, buttons, UNDO): keep it at the end -->
  <div id="decisions"></div>
</div>
<script>
  // snello.context(): {task, record, fields, workflow, user}; refreshed every 10 s and after each decision
  snello.onChange(({task, record, workflow}) => {
    document.getElementById('title').textContent = task.title;
    document.getElementById('summary').innerHTML = record
      ? '<b>' + snello.esc(record.name) + ' ' + snello.esc(record.surname) + '</b><br>'
        + snello.esc(record.email) + (workflow ? '<br><small>workflow at ' + snello.esc(workflow.currentTask) + '</small>' : '')
      : 'no record';
  });
  // more data with the viewer's token: await snello.api.get('rent_contracts/' + id)
  snello.renderDecisions(document.getElementById('decisions'));
</script>`;

@Component({
    standalone: true,
    templateUrl: './workflow-pages-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, Textarea, SelectModule]
})
export class WorkflowPagesEditComponent extends AbstractEditComponent<WorkflowPage> implements OnInit {

    private readonly configuration = inject(ConfigurationService);
    private readonly definitions = inject(WorkflowDefinitionService);
    /** Our workflows (the Workflows editor), one entry per namespace:name: a task carries no version. */
    workflowItems: {label: string; value: string}[] = [];
    workflowsError: string | null = null;
    previewTask = '';
    pagesBase = '';

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public workflowPageService: WorkflowPageService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, workflowPageService, messageService, 'workflowpages');
    }

    ngOnInit() {
        this.element = new WorkflowPage();
        super.ngOnInit();
        this.loadWorkflows();
        // pages live next to the API: https://host/api -> https://host/p
        this.configuration.getConfiguration().subscribe(c => {
            const api = String(c[API_SERVICE_PATH] ?? '/api');
            this.pagesBase = api.replace(/\/api\/?$/, '') + '/p';
        });
    }

    loadWorkflows() {
        this.definitions.getAllList({}).subscribe({
            next: (rows: WorkflowDefinition[]) => {
                // newest version first per namespace:name (the list is sorted namespace, name, version desc)
                const byKey = new Map<string, WorkflowDefinition>();
                for (const w of rows ?? []) {
                    const key = `${w.namespace}:${w.name}`;
                    if (!byKey.has(key) || w.status === 'DEPLOYED' && byKey.get(key)!.status !== 'DEPLOYED') {
                        byKey.set(key, w);
                    }
                }
                this.workflowItems = [...byKey.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, w]) => ({label: w.title ? `${key} — ${w.title}` : key, value: key}));
                this.workflowsError = null;
                console.log('[workflow-pages] workflows for the select', this.workflowItems.length, 'from', rows?.length, 'rows');
            },
            error: e => {
                this.workflowsError = e?.error?.msg || e?.message || 'workflows not available';
                console.warn('[workflow-pages] workflows not available', e);
            }
        });
    }

    /** The select's options, plus the page's current workflow when it is not in the editor (older pages). */
    get workflowOptions(): {label: string; value: string}[] {
        const current = this.workflowKey;
        if (current && !this.workflowItems.some(i => i.value === current)) {
            return [{label: `${current} (not in the Workflows editor)`, value: current}, ...this.workflowItems];
        }
        return this.workflowItems;
    }

    get workflowKey(): string | null {
        const ns = this.element?.workflow_namespace, name = this.element?.workflow_name;
        return ns && name ? `${ns}:${name}` : null;
    }

    set workflowKey(key: string | null) {
        const i = key ? key.indexOf(':') : -1;
        this.element.workflow_namespace = i > 0 ? key!.substring(0, i) : null as any;
        this.element.workflow_name = i > 0 ? key!.substring(i + 1) : null as any;
        console.log('[workflow-pages] workflow selected', key);
    }

    createInstance(): WorkflowPage {
        return new WorkflowPage();
    }

    useStarter() {
        console.log('[workflow-pages] starter body inserted');
        this.element.body = STARTER;
    }

    preview() {
        const url = `${this.pagesBase}/${encodeURIComponent(this.element.name)}?task=${encodeURIComponent(this.previewTask.trim())}`;
        console.log('[workflow-pages] preview', url);
        window.open(url, '_blank', 'noopener');
    }
}
