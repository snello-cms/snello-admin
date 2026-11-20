import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {from, of} from 'rxjs';
import {catchError, concatMap, map, toArray} from 'rxjs/operators';
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
        private cd: ChangeDetectorRef
    ) {
        super(messageService, router, confirmationService, service, 'workflowdefinitions');
        this.filters = new WorkflowDefinition();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    uploading = false;
    uploadResults: {file: string; ok: boolean; text: string}[] = [];

    /**
     * Several .yaml files at once: each becomes a new workflow (DRAFT, same checks as Save), one after the other.
     * A file whose namespace:name:version exists already is refused (409): change document.version.
     */
    uploadFiles(event: Event, datatable: any) {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        input.value = '';
        if (!files.length) {
            return;
        }
        console.log('[workflows] upload', files.length, 'file(s)', files.map(f => f.name));
        this.uploading = true;
        this.uploadResults = [];
        from(files).pipe(
            concatMap(f => from(f.size > 256 * 1024 ? Promise.reject(new Error('larger than 256 KB')) : f.text()).pipe(
                concatMap(yaml => {
                    const w = new WorkflowDefinition();
                    w.yaml = yaml;
                    return this.service.persist(w);
                }),
                map(row => ({file: f.name, ok: true,
                    text: `saved as ${row.namespace}:${row.name}:${row.version} (draft: open it to deploy)`})),
                catchError(e => of({file: f.name, ok: false, text: e?.error?.msg || e?.message || String(e)}))
            )),
            toArray()
        ).subscribe(results => {
            this.uploading = false;
            this.uploadResults = results;
            const ok = results.filter(r => r.ok).length;
            console.log('[workflows] upload done', ok, 'saved of', results.length, results);
            this.messageService.add({severity: ok === results.length ? 'success' : 'warn', summary: 'Upload',
                detail: `${ok} of ${results.length} file(s) saved as new workflows`});
            this.reload(datatable);
            this.cd.markForCheck();
        });
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }
}
