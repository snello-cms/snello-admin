import {ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, computed, effect, inject, signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe, LowerCasePipe} from '@angular/common';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {PrimeTemplate, MessageService} from 'primeng/api';
import {Subscription, interval} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {SelectClearDefaultDirective} from '../../common/select-clear-default.directive';
import {FlowService} from '../../services/flow.service';
import {FlowDefinition} from '../../models/flow-definition';
import {FlowInstance} from '../../models/flow-instance';
import {HumanTask} from '../../models/human-task';
import {HumanTaskListComponent} from '../../common/human-task-list.component';
import {flowDiagram} from '../../common/flow-diagram';
import {renderMermaid} from '../../common/mermaid-render';

/**
 * Quarkus Flow monitor: pick a workflow, see its diagram and its instances; pick an instance and the diagram shows
 * where it is (done / current / faulted). Refreshes every 5 s. Data: snello /api/flow (runner + flow-bridge).
 */
@Component({
    standalone: true,
    templateUrl: './flow-monitor.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, FormsModule, DatePipe, LowerCasePipe, SelectModule, SelectClearDefaultDirective, HumanTaskListComponent,
        TableModule, PrimeTemplate]
})
export class FlowMonitorComponent implements OnInit {

    private readonly flow = inject(FlowService);
    private readonly messages = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute);
    private readonly diagramHost = viewChild<ElementRef<HTMLDivElement>>('diagram');

    readonly definitions = signal<FlowDefinition[]>([]);
    readonly selectedKey = signal<string | null>(null);
    readonly definitionDoc = signal<any>(null);
    readonly instances = signal<FlowInstance[]>([]);
    /** human tasks of the selected instance (who it waits for + the page to decide) */
    readonly instanceTasks = signal<HumanTask[]>([]);
    /** instance ids of the selected workflow with an OPEN human task: waiting for a person */
    readonly waitingForPerson = signal<Set<string>>(new Set());
    readonly total = signal(0);
    readonly statusFilter = signal<string>('');
    readonly selectedInstance = signal<FlowInstance | null>(null);
    readonly autoRefresh = signal(true);
    readonly error = signal<string | null>(null);
    readonly lastRefresh = signal<Date | null>(null);
    /** instance id whose cancel was clicked once: the second click confirms (no browser dialogs) */
    readonly confirmCancel = signal<string | null>(null);

    readonly statusOptions = ['', 'RUNNING', 'WAITING', 'SUSPENDED', 'PENDING', 'COMPLETED', 'FAULTED', 'CANCELLED']
        .map(s => ({label: s || 'any status', value: s}));
    readonly definitionOptions = computed(() => this.definitions().map(d => ({
        label: `${d.namespace}:${d.name}:${d.version}` + (d.title ? ' — ' + d.title : ''), value: key(d)
    })));
    readonly selectedDefinition = computed(() => this.definitions().find(d => key(d) === this.selectedKey()) ?? null);

    private refreshSub?: Subscription;

    constructor() {
        // redraw whenever the workflow or the selected instance (or its refreshed state) changes
        effect(() => {
            const doc = this.definitionDoc();
            const inst = this.selectedInstance();
            const host = this.diagramHost();
            if (doc && host) {
                void renderMermaid(host.nativeElement, flowDiagram(doc, inst), 'flow-monitor');
            }
        });
    }

    ngOnInit(): void {
        this.flow.definitions().subscribe({
            next: defs => {
                console.log('[flow-monitor] definitions', defs.length);
                this.definitions.set([...defs].sort((a, b) => key(a).localeCompare(key(b))));
                // ?wf=namespace:name:version (from Workflows "Monitor") preselects that workflow
                const wanted = this.route.snapshot.queryParamMap.get('wf');
                if (wanted && this.definitions().some(d => key(d) === wanted)) {
                    console.log('[flow-monitor] preselected from link', wanted);
                    this.selectDefinition(wanted);
                } else if (!this.selectedKey() && defs.length) {
                    if (wanted) {
                        console.warn('[flow-monitor] linked workflow not loaded on the runner', wanted);
                    }
                    this.selectDefinition(key(this.definitions()[0]));
                }
            },
            error: e => this.fail('Cannot load workflows', e)
        });
        // ?wf= changing while the monitor is already open (same route, component reused): follow it
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(q => {
            const wanted = q.get('wf');
            if (wanted && wanted !== this.selectedKey() && this.definitions().some(d => key(d) === wanted)) {
                console.log('[flow-monitor] link changed to', wanted);
                this.selectDefinition(wanted);
            }
        });
        this.refreshSub = interval(5000).subscribe(() => {
            if (this.autoRefresh()) {
                this.refresh();
            }
        });
        this.destroyRef.onDestroy(() => this.refreshSub?.unsubscribe());
    }

    selectDefinition(k: string | null): void {
        console.log('[flow-monitor] workflow', k);
        this.selectedKey.set(k);
        this.selectedInstance.set(null);
        this.definitionDoc.set(null);
        this.instances.set([]);
        this.instanceTasks.set([]);
        this.waitingForPerson.set(new Set());
        this.tasksFor = null;
        const d = this.selectedDefinition();
        if (!d) {
            return;
        }
        this.flow.definition(d).subscribe({
            next: doc => this.definitionDoc.set(doc),
            error: e => this.fail('Cannot load the workflow definition', e)
        });
        this.refresh();
    }

    setStatus(s: string): void {
        this.statusFilter.set(s ?? '');
        this.refresh();
    }

    refresh(): void {
        const d = this.selectedDefinition();
        if (!d) {
            return;
        }
        this.flow.instances({namespace: d.namespace, name: d.name, version: d.version, status: this.statusFilter(), limit: 200})
            .subscribe({
                next: r => {
                    this.instances.set(r.instances);
                    this.total.set(r.total);
                    this.error.set(null);
                    this.lastRefresh.set(new Date());
                    const sel = this.selectedInstance();
                    if (sel) {
                        this.loadInstance(sel.instanceId);
                    }
                    this.loadOpenTasks(d);
                },
                error: e => this.fail('Cannot load instances', e)
            });
    }

    selectInstance(i: FlowInstance | null): void {
        console.log('[flow-monitor] instance', i?.instanceId);
        this.confirmCancel.set(null);
        this.instanceTasks.set([]);
        if (!i) {
            this.tasksFor = null;
            this.selectedInstance.set(null);
            return;
        }
        this.loadInstance(i.instanceId);
    }

    /** instance whose human tasks were asked last: an older answer arriving late is ignored */
    private tasksFor: string | null = null;

    private loadInstance(id: string): void {
        this.tasksFor = id;
        this.flow.instance(id).subscribe({
            next: full => this.selectedInstance.set(full),
            error: e => this.fail('Cannot load instance ' + id, e)
        });
        // not fatal: the monitor works without the tasks (e.g. a snello without human tasks)
        this.flow.tasksOf(id).subscribe({
            next: tasks => {
                if (this.tasksFor === id) {
                    this.instanceTasks.set(tasks ?? []);
                }
                console.log('[flow-monitor] human tasks of', id, (tasks ?? []).length);
            },
            error: e => console.warn('[flow-monitor] human tasks of', id, 'not available', e)
        });
    }

    private loadOpenTasks(d: FlowDefinition): void {
        this.flow.openTasksOfWorkflow(d.namespace, d.name).subscribe({
            next: tasks => {
                const ids = new Set((tasks ?? []).map(t => t.instance_id).filter((x): x is string => !!x));
                this.waitingForPerson.set(ids);
                console.log('[flow-monitor] instances waiting for a person', ids.size);
            },
            error: e => console.warn('[flow-monitor] open human tasks not available', e)
        });
    }

    control(i: FlowInstance, action: 'suspend' | 'resume' | 'cancel', event: Event): void {
        event.stopPropagation();
        if (action === 'cancel' && this.confirmCancel() !== i.instanceId) {
            this.confirmCancel.set(i.instanceId);
            return;
        }
        this.confirmCancel.set(null);
        this.flow.control(i, action).subscribe({
            next: () => {
                this.messages.add({severity: 'success', summary: `${action} sent`, detail: i.instanceId});
                this.refresh();
            },
            error: e => this.fail(`${action} failed`, e)
        });
    }

    isActive(i: FlowInstance): boolean {
        return !['COMPLETED', 'FAULTED', 'CANCELLED'].includes(i.status);
    }

    duration(i: FlowInstance): string {
        const start = Date.parse(i.startedAt);
        const end = i.endedAt ? Date.parse(i.endedAt) : Date.now();
        if (isNaN(start)) {
            return '';
        }
        const s = Math.max(0, Math.round((end - start) / 1000));
        return s < 60 ? s + ' s' : s < 3600 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' s'
            : Math.floor(s / 3600) + ' h ' + Math.floor((s % 3600) / 60) + ' min';
    }

    taskRows(i: FlowInstance | null): {position: string; name: string; state: string; count: number; faults?: number; lastError?: string; at: string}[] {
        return Object.entries(i?.tasks ?? {}).map(([position, t]) => ({position, ...t}))
            .sort((a, b) => a.at.localeCompare(b.at));
    }

    private fail(summary: string, e: any): void {
        const detail = e?.error?.error ?? e?.message ?? String(e);
        console.error('[flow-monitor]', summary, e);
        this.error.set(summary + ': ' + detail);
    }
}

function key(d: FlowDefinition): string {
    return `${d.namespace}:${d.name}:${d.version}`;
}
