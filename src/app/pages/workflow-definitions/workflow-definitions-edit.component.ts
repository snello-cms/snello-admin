import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, inject, viewChild} from '@angular/core';
import {DatePipe, LowerCasePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {Subject, Subscription, forkJoin, interval, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, startWith, switchMap} from 'rxjs/operators';
import {WorkflowDefinition} from '../../models/workflow-definition';
import {WorkflowValidation} from '../../models/workflow-validation';
import {WorkflowDefinitionService} from '../../services/workflow-definition.service';
import {flowDiagram} from '../../common/flow-diagram';
import {renderMermaid} from '../../common/mermaid-render';
import {HELLO_EXAMPLE, approvalExample} from './workflow-examples';
import {FlowService} from '../../services/flow.service';
import {ConfigurationService} from '../../services/configuration.service';
import {FlowInstance} from '../../models/flow-instance';
import {HumanTask} from '../../models/human-task';

/**
 * Workflow editor: the YAML is the only input (namespace/name/version/title come from its document block).
 * While typing, snello checks it (POST /validate, debounced) and the diagram is redrawn from the parsed workflow.
 * Deploy = flow-bridge writes the runner's workflow file and waits until the runner has loaded it (or returns the
 * runner's error). A deployed version is read-only: "New version" copies it with the patch version bumped.
 */
@Component({
    standalone: true,
    templateUrl: './workflow-definitions-edit.component.html',
    styleUrl: './workflow-status.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, FormsModule, Textarea, DatePipe, LowerCasePipe]
})
export class WorkflowDefinitionsEditComponent extends AbstractEditComponent<WorkflowDefinition> implements OnInit, AfterViewInit {

    private readonly cd = inject(ChangeDetectorRef);
    private readonly diagramHost = viewChild<ElementRef<HTMLDivElement>>('diagram');
    private readonly yamlChanges = new Subject<string>();
    private readonly flow = inject(FlowService);
    private readonly configuration = inject(ConfigurationService);

    // Run panel (deployed workflows): start an instance and follow it
    runInput = '{}';
    runError = '';
    starting = false;
    run: FlowInstance | null = null;
    runTasks: HumanTask[] = [];
    private runPoll?: Subscription;

    check: {ok: boolean; text: string} | null = null;
    parsed: WorkflowValidation | null = null;
    deploying = false;
    /** null = unknown yet; false = this snello cannot deploy (bridge URL/token missing or bridge writes off) */
    deployAvailable: boolean | null = null;
    deployUnavailableReason = '';
    /** YAML as last saved: Deploy saves first when it differs */
    private savedYaml = '';

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public workflowService: WorkflowDefinitionService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, workflowService, messageService, 'workflowdefinitions');
    }

    ngOnInit() {
        this.element = new WorkflowDefinition();
        // subscribe before super.ngOnInit(): postFind / postCreate already push the YAML
        this.yamlChanges.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(yaml => yaml.trim()
                ? this.workflowService.validate(yaml).pipe(catchError(e => of({error: e})))
                : of(null)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(r => this.showCheck(r));
        super.ngOnInit();
        this.workflowService.deployStatus().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: s => {
                this.deployAvailable = !!s?.writes;
                this.deployUnavailableReason = s?.writes ? '' : 'flow-bridge has workflow writes off (WORKFLOWS_DIR / BRIDGE_WRITE_TOKEN)';
                console.log('[workflows] deploy available:', this.deployAvailable, s);
                this.cd.markForCheck();
            },
            error: e => {
                this.deployAvailable = false;
                this.deployUnavailableReason = e?.error?.error ?? e?.error?.msg ?? 'flow-bridge not reachable';
                console.warn('[workflows] deploy not available', e);
                this.cd.markForCheck();
            }
        });
    }

    ngAfterViewInit() {
        // a new workflow starts empty: nothing to draw until the YAML is there
        if (this.element?.yaml) {
            this.onYaml(this.element.yaml);
        }
    }

    createInstance(): WorkflowDefinition {
        const w = new WorkflowDefinition();
        w.status = 'DRAFT';
        w.yaml = '';
        return w;
    }

    /** "New version" of a deployed workflow arrives here with its YAML in the router state. */
    postCreate() {
        const yaml = history.state?.yaml;
        if (typeof yaml === 'string' && yaml) {
            console.log('[workflows] new draft from a copy,', yaml.length, 'chars');
            this.element.yaml = yaml;
            this.onYaml(yaml);
        }
    }

    postFind() {
        this.savedYaml = this.element.yaml ?? '';
        console.log('[workflows] loaded', this.element.uuid, this.idOf(), this.element.status);
        this.onYaml(this.element.yaml ?? '');
    }

    get readOnly(): boolean {
        return this.element?.status === 'DEPLOYED';
    }

    get dirty(): boolean {
        return (this.element?.yaml ?? '') !== this.savedYaml;
    }

    idOf(): string {
        const d = this.parsed?.document;
        if (d) {
            return `${d.namespace}:${d.name}:${d.version}`;
        }
        return this.element?.namespace ? `${this.element.namespace}:${this.element.name}:${this.element.version}` : '';
    }

    onYaml(yaml: string) {
        this.yamlChanges.next(yaml ?? '');
    }

    useStarter() {
        console.log('[workflows] starter inserted');
        this.element.yaml = HELLO_EXAMPLE;
        this.onYaml(HELLO_EXAMPLE);
    }

    /** Approval example with this snello's Keycloak as token authority (from the admin's runtime config). */
    useApprovalExample() {
        this.configuration.getConfiguration().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(c => {
            const kc = (c as any).keycloakConfig ?? {};
            const yaml = approvalExample(kc.url, kc.realm);
            console.log('[workflows] approval example inserted, authority from', kc.url, kc.realm);
            this.element.yaml = yaml;
            this.onYaml(yaml);
            this.cd.markForCheck();
        });
    }

    /** Sample input from the workflow's input schema: every property, strings empty ("" / 0 / false / {}). */
    private sampleInput(workflow: any): string {
        const props = workflow?.input?.schema?.document?.properties ?? {};
        const sample: Record<string, unknown> = {};
        for (const [k, v] of Object.entries<any>(props)) {
            const t = Array.isArray(v?.type) ? v.type[0] : v?.type;
            sample[k] = t === 'number' || t === 'integer' ? 0 : t === 'boolean' ? false : t === 'object' ? {} : t === 'array' ? [] : '';
        }
        return JSON.stringify(sample, null, 2);
    }

    startRun() {
        let input: any;
        try {
            input = JSON.parse(this.runInput || '{}');
        } catch (e) {
            this.runError = 'input is not valid JSON: ' + (e as Error).message;
            return;
        }
        this.runError = '';
        this.starting = true;
        this.runTasks = [];
        this.run = null;
        this.runPoll?.unsubscribe();
        const e = this.element;
        this.flow.start(e.namespace, e.name, input, e.version).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: r => {
                this.starting = false;
                console.log('[workflows] started', r.instanceId, r.status);
                this.run = {instanceId: r.instanceId, status: r.status, namespace: e.namespace, name: e.name,
                    version: e.version} as FlowInstance;
                this.followRun(r.instanceId);
                this.cd.markForCheck();
            },
            error: err => {
                this.starting = false;
                this.runError = err?.error?.detail ?? err?.error?.msg ?? err?.error?.error ?? err?.message ?? String(err);
                console.warn('[workflows] start failed', err);
                this.cd.markForCheck();
            }
        });
    }

    /** Status + current task (flow-bridge) and the instance's human tasks, every 3 s until it ends. */
    private followRun(id: string) {
        this.runPoll = interval(3000).pipe(
            startWith(0),
            switchMap(() => forkJoin({
                inst: this.flow.instance(id).pipe(catchError(() => of(null))),
                tasks: this.flow.tasksOf(id).pipe(catchError(() => of([] as HumanTask[])))
            })),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(({inst, tasks}) => {
            if (inst) {
                this.run = inst;
            }
            this.runTasks = tasks ?? [];
            if (inst && ['COMPLETED', 'FAULTED', 'CANCELLED'].includes(inst.status)) {
                console.log('[workflows] run', id, 'ended', inst.status);
                this.runPoll?.unsubscribe();
            }
            this.cd.markForCheck();
        });
    }

    get runEnded(): boolean {
        return !!this.run && ['COMPLETED', 'FAULTED', 'CANCELLED'].includes(this.run.status);
    }

    private showCheck(r: WorkflowValidation | {error: any} | null) {
        if (!r) {
            this.check = null;
            this.parsed = null;
            this.drawDiagram(null);
        } else if ('error' in r) {
            const e = r.error;
            this.check = {ok: false, text: e?.error?.msg ?? e?.message ?? 'invalid'};
            // keep the last good diagram while the YAML is being fixed
        } else {
            this.parsed = r;
            if (this.runInput === '{}' || !this.runInput.trim()) {
                this.runInput = this.sampleInput(r.workflow);
            }
            const tasks = Array.isArray(r.workflow?.do) ? r.workflow.do.length : 0;
            this.check = {ok: true, text: `${r.document.namespace}:${r.document.name}:${r.document.version} · ${tasks} task${tasks === 1 ? '' : 's'}`};
            this.drawDiagram(r.workflow);
        }
        this.cd.markForCheck();
    }

    private drawDiagram(workflow: any) {
        const host = this.diagramHost()?.nativeElement;
        if (!host) {
            return;
        }
        if (!workflow) {
            host.textContent = '';
            return;
        }
        void renderMermaid(host, flowDiagram(workflow), 'workflows');
    }

    /** After the first save, stay here (the next step is usually Deploy). */
    navigateAfterSave() {
        this.savedYaml = this.element.yaml ?? '';
        this.router.navigate(['/workflowdefinitions/edit', this.element.uuid], {replaceUrl: true});
    }

    navigateAfterUpdate() {
        this.savedYaml = this.element.yaml ?? '';
        this.onYaml(this.element.yaml ?? '');
    }

    deploy() {
        if (this.dirty) {
            // save first, so what is deployed is what is shown
            this.workflowService.update(this.element).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: saved => {
                    this.element = saved;
                    this.savedYaml = saved.yaml ?? '';
                    this.doDeploy();
                },
                error: e => this.addError('Unable to save before deploy. ' + (e || ''))
            });
            return;
        }
        this.doDeploy();
    }

    private doDeploy() {
        this.deploying = true;
        this.cd.markForCheck();
        const started = Date.now();
        console.log('[workflows] deploy', this.element.uuid, this.idOf());
        this.workflowService.deploy(this.element.uuid).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: row => {
                this.deploying = false;
                this.element = row;
                this.savedYaml = row.yaml ?? '';
                console.log('[workflows] deployed', this.idOf(), 'in', Date.now() - started, 'ms');
                this.addInfo(`${this.idOf()} deployed: ${row.message ?? ''}`);
                this.cd.markForCheck();
            },
            error: e => {
                this.deploying = false;
                const msg = e?.error?.msg ?? e?.message ?? String(e);
                console.warn('[workflows] deploy failed', this.idOf(), e);
                this.addError('Deploy refused: ' + msg);
                // the row now says FAILED (refused) or keeps its status (bridge trouble): reload it
                this.workflowService.find(this.element.uuid).subscribe(r => {
                    this.element = r;
                    this.cd.markForCheck();
                });
                this.cd.markForCheck();
            }
        });
    }

    /** Copies this workflow as a new unsaved draft, patch version + 1 (1.0.0 -> 1.0.1; anything else: append ".1"). */
    newVersion() {
        const current = this.parsed?.document?.version ?? this.element.version ?? '1.0.0';
        const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
        const next = m ? `${m[1]}.${m[2]}.${Number(m[3]) + 1}` : current + '.1';
        const yaml = (this.element.yaml ?? '').replace(
            /^(\s+version:\s*)(["']?)[^"'\s#]+\2/m, (_all, pre, q) => `${pre}${q || '"'}${next}${q || '"'}`);
        console.log('[workflows] new version', current, '->', next);
        this.router.navigate(['/workflowdefinitions/new'], {state: {yaml}});
    }

    download() {
        const name = this.parsed?.document
            ? `${this.parsed.document.namespace}-${this.parsed.document.name}.yaml`
            : 'workflow.yaml';
        const url = URL.createObjectURL(new Blob([this.element.yaml ?? ''], {type: 'application/yaml'}));
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        console.log('[workflows] downloaded', name);
    }
}
