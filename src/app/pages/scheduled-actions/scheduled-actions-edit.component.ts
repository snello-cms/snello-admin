import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {of, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ScheduledAction} from '../../models/scheduled-action';
import {CronPreview} from '../../models/cron-preview';
import {ScheduledActionService} from '../../services/scheduled-action.service';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectModule} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';
import {DialogModule} from 'primeng/dialog';
import {ToggleSwitchModule} from 'primeng/toggleswitch';

@Component({
    standalone: true,
    templateUrl: './scheduled-actions-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, SelectModule, InputText, Textarea,
        DialogModule, ToggleSwitchModule, DatePipe]
})
export class ScheduledActionsEditComponent extends AbstractEditComponent<ScheduledAction> implements OnInit {

    showLegendDialog = false;
    preset: string | null = null;
    preview: CronPreview | null = null;
    running = false;

    /** Common schedules; the value is a 5-field cron the API accepts as-is. */
    presetItems: SelectItem[] = [
        {label: 'Every 5 minutes', value: '*/5 * * * *'},
        {label: 'Every 15 minutes', value: '*/15 * * * *'},
        {label: 'Every hour', value: '0 * * * *'},
        {label: 'Every 6 hours', value: '0 */6 * * *'},
        {label: 'Every day at 03:00', value: '0 3 * * *'},
        {label: 'Every day at 17:00', value: '0 17 * * *'},
        {label: 'Monday to Friday at 08:00', value: '0 8 * * 1-5'},
        {label: 'Every Monday at 08:00', value: '0 8 * * 1'},
        {label: 'First day of the month at 06:00', value: '0 6 1 * *'}
    ];

    private readonly frequency$ = new Subject<string>();

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public scheduledActionService: ScheduledActionService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, scheduledActionService, messageService, 'scheduledactions');
    }

    ngOnInit() {
        this.element = new ScheduledAction();
        this.frequency$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(freq => freq?.trim()
                ? this.scheduledActionService.preview(freq.trim()).pipe(
                    catchError(err => of(<CronPreview>{valid: false, error: err?.error?.error ?? 'invalid cron expression'})))
                : of(null)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(p => {
            console.log('[scheduled-actions] preview', p);
            this.preview = p;
        });
        super.ngOnInit();
    }

    createInstance(): ScheduledAction {
        return new ScheduledAction();
    }

    postFind() {
        this.onFrequencyChange();
    }

    applyPreset() {
        if (this.preset) {
            this.element.frequency = this.preset;
            this.onFrequencyChange();
        }
    }

    onFrequencyChange() {
        this.frequency$.next(this.element.frequency ?? '');
    }

    runNow() {
        if (!this.element.uuid) {
            return;
        }
        this.running = true;
        console.log('[scheduled-actions] run now', this.element.uuid, this.element.name);
        this.scheduledActionService.runNow(this.element.uuid).subscribe({
            next: outcome => {
                this.running = false;
                this.element.last_status = outcome.last_status;
                this.element.last_run = outcome.last_run;
                this.element.last_message = outcome.last_message;
                this.element.last_duration_ms = outcome.last_duration_ms;
                if (outcome.last_status === 'OK') {
                    this.addInfo(`Run completed in ${outcome.last_duration_ms ?? 0} ms.`);
                } else {
                    this.addError(`Run ${outcome.last_status}: ${outcome.last_message || ''}`);
                }
            },
            error: err => {
                this.running = false;
                this.addError('Unable to run the job. ' + (err?.message ?? err));
            }
        });
    }
}
