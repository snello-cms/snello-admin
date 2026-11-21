import {ChangeDetectionStrategy, Component, OnInit, inject} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {
    IntrospectCatalog,
    IntrospectJob,
    IntrospectService
} from '../../services/introspect.service';
import {IntrospectResult} from '../../models/introspect-result';
import {IntrospectedEntity} from '../../models/introspected-entity';
import {IntrospectRequest} from '../../models/introspect-request';

const MAX_SELECT = 15;

/**
 * Generate metadata from the DB schema: catalog + selective preview/apply (≤15), or full async batch.
 */
@Component({
    standalone: true,
    templateUrl: './metadata-introspect.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, FormsModule]
})
export class MetadataIntrospectComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly service = inject(IntrospectService);
    private readonly messageService = inject(MessageService);

    readonly maxSelect = MAX_SELECT;
    catalog: IntrospectCatalog | null = null;
    metadataGroup = '';
    sampleRows = 5;
    loading = false;
    preview: IntrospectResult | null = null;
    applied: IntrospectResult | null = null;
    /** tables ticked for apply */
    selected = new Set<string>();
    /** tables whose field list is expanded */
    expanded = new Set<string>();
    jobs: IntrospectJob[] = [];

    ngOnInit() {
        this.reloadCatalog();
        this.reloadJobs();
    }

    get candidates(): IntrospectedEntity[] {
        return (this.preview?.entities ?? []).filter(e => !e.skipped);
    }

    get skipped(): IntrospectedEntity[] {
        return (this.preview?.entities ?? []).filter(e => e.skipped);
    }

    goToMetadataList() {
        this.router.navigate(['/metadata/list']);
    }

    reloadCatalog() {
        this.service.catalog().subscribe({
            next: c => this.catalog = c,
            error: err => this.messageService.add({severity: 'error', summary: 'Catalog failed', detail: err?.message})
        });
    }

    reloadJobs() {
        this.service.listJobs().subscribe({
            next: jobs => this.jobs = jobs || [],
            error: () => { /* batch endpoints may be unavailable on older APIs */ }
        });
    }

    runPreview() {
        this.loading = true;
        this.applied = null;
        this.service.preview(this.request()).subscribe({
            next: result => {
                this.preview = result;
                this.selected = new Set(this.candidates.slice(0, MAX_SELECT).map(e => e.table_name));
                this.expanded.clear();
                this.loading = false;
                if (this.candidates.length > MAX_SELECT) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: `Select at most ${MAX_SELECT} tables, or use full batch import.`
                    });
                }
                if (!this.candidates.length) {
                    this.messageService.add({severity: 'info', summary: 'Every table already has a metadata.'});
                }
            },
            error: err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Preview failed', detail: err?.message});
            }
        });
    }

    apply() {
        const tables = [...this.selected];
        if (!tables.length) {
            this.messageService.add({severity: 'warn', summary: 'Select at least one table.'});
            return;
        }
        if (tables.length > MAX_SELECT) {
            this.messageService.add({
                severity: 'warn',
                summary: `Select at most ${MAX_SELECT} tables, or use full batch import.`
            });
            return;
        }
        this.loading = true;
        this.service.apply({...this.request(), tables}).subscribe({
            next: result => {
                this.applied = result;
                this.loading = false;
                const created = result.entities.filter(e => !e.skipped).length;
                this.messageService.add(result.valid && result.applied
                    ? {severity: 'success', summary: `Generated ${created} metadata(s).`}
                    : {severity: 'error', summary: 'Apply rejected', detail: result.errors.join('; ')});
                if (result.applied) {
                    this.preview = null;
                    this.reloadCatalog();
                    this.reloadJobs();
                }
            },
            error: err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Apply failed', detail: err?.message});
            }
        });
    }

    startBatch() {
        this.loading = true;
        const group = this.metadataGroup.trim();
        this.service.startBatch(this.sampleRows, group || undefined).subscribe({
            next: job => {
                this.loading = false;
                this.messageService.add({severity: 'success', summary: 'Batch started.'});
                this.router.navigate(['/metadata/introspect/batch', job.uuid]);
            },
            error: err => {
                this.loading = false;
                const detail = err?.error?.error || err?.message;
                this.messageService.add({severity: 'error', summary: 'Batch start failed', detail});
            }
        });
    }

    openJob(job: IntrospectJob) {
        this.router.navigate(['/metadata/introspect/batch', job.uuid]);
    }

    toggle(set: Set<string>, table: string) {
        if (set.has(table)) {
            set.delete(table);
            return;
        }
        if (set.size >= MAX_SELECT) {
            this.messageService.add({
                severity: 'warn',
                summary: `Select at most ${MAX_SELECT} tables, or use full batch import.`
            });
            return;
        }
        set.add(table);
    }

    toggleAll(checked: boolean) {
        this.selected = checked
            ? new Set(this.candidates.slice(0, MAX_SELECT).map(e => e.table_name))
            : new Set();
    }

    openMetadata(table: string) {
        this.router.navigate(['/metadata/list'], {queryParams: {table_name: table}});
    }

    private request(): IntrospectRequest {
        const group = this.metadataGroup.trim();
        return {
            sample_rows: this.sampleRows,
            ...(group ? {metadata_group: group} : {})
        };
    }
}
