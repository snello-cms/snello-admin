import {Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {
    IntrospectJob,
    IntrospectJobLog,
    IntrospectService
} from '../../services/introspect.service';

@Component({
    standalone: true,
    templateUrl: './metadata-introspect-batch.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, SideBarComponent, AdminhomeTopBar]
})
export class MetadataIntrospectBatchComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly service = inject(IntrospectService);
    private readonly messages = inject(MessageService);

    job: IntrospectJob | null = null;
    logs: IntrospectJobLog[] = [];
    private lastLogUuid: string | undefined;
    private timer: ReturnType<typeof setInterval> | null = null;
    private uuid = '';

    ngOnInit() {
        this.uuid = this.route.snapshot.paramMap.get('uuid') || '';
        if (!this.uuid) {
            this.router.navigate(['/metadata/introspect']);
            return;
        }
        this.pollOnce();
        this.timer = setInterval(() => this.pollOnce(), 2000);
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    goBack() {
        this.router.navigate(['/metadata/introspect']);
    }

    cancel() {
        this.service.cancel(this.uuid).subscribe({
            next: (job) => {
                this.job = job;
                this.messages.add({severity: 'warn', summary: 'Cancel requested.'});
            },
            error: (e) => this.messages.add({severity: 'error', summary: this.err(e)})
        });
    }

    get active(): boolean {
        return this.job?.status === 'queued' || this.job?.status === 'running';
    }

    get progressPct(): number {
        if (!this.job || !this.job.total_tables) {
            return this.job?.status === 'completed' ? 100 : 0;
        }
        return Math.min(100, Math.round((this.job.done_tables / this.job.total_tables) * 100));
    }

    private pollOnce() {
        this.service.getJob(this.uuid).subscribe({
            next: (job) => {
                this.job = job;
                if (!this.active && this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            },
            error: (e) => this.messages.add({severity: 'error', summary: this.err(e)})
        });
        this.service.getLogs(this.uuid, this.lastLogUuid).subscribe({
            next: (lines) => {
                if (!lines?.length) {
                    return;
                }
                this.logs = [...this.logs, ...lines];
                this.lastLogUuid = lines[lines.length - 1].uuid;
            },
            error: () => { /* ignore transient log errors while polling */ }
        });
    }

    private err(e: any): string {
        if (!e) {
            return 'Request failed';
        }
        if (typeof e === 'string') {
            return e;
        }
        return e.error?.error || e.error?.message || e.message || 'Request failed';
    }
}
