import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, inject, viewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {forkJoin} from 'rxjs';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FlowService} from '../../services/flow.service';
import {FlowDefinition} from '../../models/flow-definition';
import {flowDiagram} from '../../common/flow-diagram';
import {renderMermaid} from '../../common/mermaid-render';

/**
 * Read-only view of a workflow the runner loaded without the admin's editor (git-managed: snello-flows/workflows ->
 * aruba-k8s ConfigMap -> runner workflows folder at every start). YAML as the runner loaded it + diagram.
 */
@Component({
    standalone: true,
    templateUrl: './workflow-runner-view.component.html',
    styleUrl: './workflow-status.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SideBarComponent, AdminhomeTopBar, FormsModule, Textarea]
})
export class WorkflowRunnerViewComponent implements OnInit {

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly flow = inject(FlowService);
    private readonly cd = inject(ChangeDetectorRef);
    private readonly diagramHost = viewChild<ElementRef<HTMLElement>>('diagram');

    def: FlowDefinition = {namespace: '', name: '', version: ''};
    yaml = '';
    loading = true;
    error: string | null = null;

    ngOnInit() {
        const p = this.route.snapshot.paramMap;
        this.def = {namespace: p.get('namespace') ?? '', name: p.get('name') ?? '', version: p.get('version') ?? ''};
        console.log('[workflows] runner view', this.key());
        forkJoin({doc: this.flow.definition(this.def), yaml: this.flow.definitionYaml(this.def)}).subscribe({
            next: ({doc, yaml}) => {
                this.yaml = yaml;
                this.def = {...this.def, title: doc?.document?.title, summary: doc?.document?.summary};
                this.loading = false;
                console.log('[workflows] runner view loaded', this.key(), yaml.length, 'chars,', (doc?.do ?? []).length, 'tasks');
                this.cd.markForCheck();
                const host = this.diagramHost()?.nativeElement;
                if (host) {
                    void renderMermaid(host, flowDiagram(doc), 'workflows-runner');
                } else {
                    console.warn('[workflows] runner view: no diagram host');
                }
            },
            error: e => {
                this.loading = false;
                this.error = e?.status === 404 ? 'the runner has not loaded this workflow (any more)'
                    : (e?.error?.error || e?.message || 'runner not reachable');
                console.warn('[workflows] runner view failed', this.key(), e);
                this.cd.markForCheck();
            }
        });
    }

    key() {
        return `${this.def.namespace}:${this.def.name}:${this.def.version}`;
    }

    download() {
        const name = `${this.def.namespace}-${this.def.name}-${this.def.version}.yaml`;
        const url = URL.createObjectURL(new Blob([this.yaml], {type: 'application/yaml'}));
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        console.log('[workflows] downloaded', name);
    }

    monitor() {
        this.router.navigate(['/flowmonitor/list'], {queryParams: {wf: this.key()}});
    }

    back() {
        this.router.navigate(['/workflowdefinitions/list']);
    }
}
