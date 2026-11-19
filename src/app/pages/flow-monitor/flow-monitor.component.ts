import {ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, computed, effect, inject, signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe, LowerCasePipe} from '@angular/common';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {PrimeTemplate, MessageService} from 'primeng/api';
import {Subscription, interval} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {SelectClearDefaultDirective} from '../../common/select-clear-default.directive';
import {FlowService} from '../../services/flow.service';
import {FlowDefinition} from '../../models/flow-definition';
import {FlowInstance} from '../../models/flow-instance';
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
    imports: [SideBarComponent, AdminhomeTopBar, FormsModule, DatePipe, LowerCasePipe, SelectModule, SelectClearDefaultDirective,
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
                },
                error: e => this.fail('Cannot load instances', e)
            });
    }

    selectInstance(i: FlowInstance | null): void {
        console.log('[flow-monitor] instance', i?.instanceId);
        this.confirmCancel.set(null);
        if (!i) {
            this.selectedInstance.set(null);
            return;
        }
        this.loadInstance(i.instanceId);
    }

    private loadInstance(id: string): void {
        this.flow.instance(id).subscribe({
            next: full => this.selectedInstance.set(full),
            error: e => this.fail('Cannot load instance ' + id, e)
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
