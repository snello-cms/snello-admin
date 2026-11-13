import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {IntrospectService} from '../../services/introspect.service';
import {IntrospectResult} from '../../models/introspect-result';
import {IntrospectedEntity} from '../../models/introspected-entity';
import {IntrospectRequest} from '../../models/introspect-request';

/**
 * Generate metadata from the DB schema: preview what /api/introspect infers for tables not yet described,
 * pick the ones to keep, apply. Apply only writes metadatas/fielddefinitions rows (already_exist=true), never DDL.
 */
@Component({
    standalone: true,
    templateUrl: './metadata-introspect.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, FormsModule]
})
export class MetadataIntrospectComponent {
    private readonly router = inject(Router);
    private readonly service = inject(IntrospectService);
    private readonly messageService = inject(MessageService);

    metadataGroup = '';
    sampleRows = 30;
    loading = false;
    preview: IntrospectResult | null = null;
    applied: IntrospectResult | null = null;
    /** tables ticked for apply */
    selected = new Set<string>();
    /** tables whose field list is expanded */
    expanded = new Set<string>();

    get candidates(): IntrospectedEntity[] {
        return (this.preview?.entities ?? []).filter(e => !e.skipped);
    }

    get skipped(): IntrospectedEntity[] {
        return (this.preview?.entities ?? []).filter(e => e.skipped);
    }

    goToMetadataList() {
        this.router.navigate(['/metadata/list']);
    }

    runPreview() {
        this.loading = true;
        this.applied = null;
        this.service.preview(this.request()).subscribe({
            next: result => {
                this.preview = result;
                // everything inferable is ticked by default: the admin unticks what they don't want
                this.selected = new Set(this.candidates.map(e => e.table_name));
                this.expanded.clear();
                this.loading = false;
                console.info(`[introspect] preview candidates=${this.candidates.length} skipped=${this.skipped.length}`);
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
                    // applied tables are now "already referenced": refresh so they move to skipped
                    this.preview = null;
                }
            },
            error: err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Apply failed', detail: err?.message});
            }
        });
    }

    toggle(set: Set<string>, table: string) {
        if (set.has(table)) {
            set.delete(table);
        } else {
            set.add(table);
        }
    }

    toggleAll(checked: boolean) {
        this.selected = checked ? new Set(this.candidates.map(e => e.table_name)) : new Set();
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
