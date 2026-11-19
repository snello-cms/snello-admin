import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {HumanTask} from '../models/human-task';

/**
 * The human tasks of one workflow instance (who it waits for, the page to decide, the decision taken): shown by the
 * Workflow Monitor for the selected instance and by the Workflows Run panel.
 */
@Component({
    selector: 'human-task-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe],
    template: `
        @for (t of tasks(); track t.uuid) {
            <div class="ht-row">
                <span class="ht-status ht-{{ t.status === 'OPEN' ? 'open' : t.status === 'CANCELLED' ? 'cancelled' : 'closed' }}">{{ t.status }}</span>
                <span class="ht-title">{{ t.title }}</span>
                @if (t.decision) {
                    — <b>{{ t.decision }}</b> by {{ t.decided_by }}
                    @if (t.decided_at) { <span class="ht-muted">{{ t.decided_at | date:'dd/MM HH:mm' }}</span> }
                } @else if (t.status === 'OPEN') {
                    <span class="ht-muted">waiting for {{ t.roles || 'a reviewer' }}</span>
                }
                @if (t.status === 'OPEN') {
                    <a class="btn btn-success btn-sm ht-open-btn" [href]="t.url" target="_blank" rel="noopener">
                        <i class="fa fa-external-link"></i> {{ openLabel() }}</a>
                } @else {
                    <a class="ht-link" [href]="t.url" target="_blank" rel="noopener">page</a>
                }
            </div>
        } @empty {
            @if (emptyText()) { <div class="ht-muted">{{ emptyText() }}</div> }
        }
    `,
    styles: [`
        .ht-row { margin-top: 6px; line-height: 1.9; }
        .ht-status { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; margin-right: 4px; }
        .ht-open-btn { margin-left: 8px; }
        .ht-status.ht-open { background: #eef0f3; color: #4b5563; }
        .ht-status.ht-closed { background: #dcfce7; color: #166534; }
        .ht-status.ht-cancelled { background: #fee2e2; color: #991b1b; }
        .ht-muted { color: #6b7280; font-size: 12px; margin-left: 4px; }
        .ht-link { margin-left: 8px; }
    `]
})
export class HumanTaskListComponent {
    readonly tasks = input<HumanTask[]>([]);
    readonly openLabel = input('Open review page');
    readonly emptyText = input<string | null>(null);
}
