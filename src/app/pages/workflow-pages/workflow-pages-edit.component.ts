import {Component, OnInit, ChangeDetectionStrategy, inject} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';
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
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, Textarea]
})
export class WorkflowPagesEditComponent extends AbstractEditComponent<WorkflowPage> implements OnInit {

    private readonly configuration = inject(ConfigurationService);
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
        // pages live next to the API: https://host/api -> https://host/p
        this.configuration.getConfiguration().subscribe(c => {
            const api = String(c[API_SERVICE_PATH] ?? '/api');
            this.pagesBase = api.replace(/\/api\/?$/, '') + '/p';
        });
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
