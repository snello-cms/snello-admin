import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {SideBarComponent} from '../../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../../adminhome-topbar/adminhome-topbar.component';
import {AiNavComponent} from '../ai-nav.component';
import {AiHistorySession} from '../../../models/ai-history-session';
import {AiHistoryEvent} from '../../../models/ai-history-event';
import {AiHistoryService} from '../../../services/ai-history.service';

/** One conversation, oldest first: requests, answers, tool calls and errors. */
@Component({
    selector: 'ai-history-view',
    standalone: true,
    templateUrl: './ai-history-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, DatePipe, RouterLink],
    styles: [`
      .turn { margin: 0 0 12px; padding: 10px 14px; border-radius: 6px; border-left: 4px solid #999; }
      .turn.request { border-left-color: #2f7bd8; }
      .turn.response { border-left-color: #2e9e5b; }
      .turn.tool { border-left-color: #b58a00; }
      .turn.error { border-left-color: #d64545; }
      .turn-head { font-size: .85em; opacity: .75; margin-bottom: 4px; }
      .turn pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-family: inherit; }
      .turn.tool pre { font-family: monospace; }
    `]
})
export class AiHistoryViewComponent implements OnInit {

    private readonly route = inject(ActivatedRoute);
    private readonly service = inject(AiHistoryService);
    private readonly destroyRef = inject(DestroyRef);

    readonly session = signal<AiHistorySession | null>(null);
    readonly events = signal<AiHistoryEvent[]>([]);
    readonly error = signal<string>('');

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        console.log('[ai-history] open session', id);
        this.service.find(id).pipe(
            tap(s => this.session.set(s)),
            switchMap((s: AiHistorySession) => this.service.transcript(s.session_id)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: events => {
                console.log('[ai-history] transcript of', id, events.length, 'events');
                this.events.set(events);
            },
            error: err => this.error.set(String(err?.message ?? err))
        });
    }
}
