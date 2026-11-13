import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService, PrimeTemplate, SelectItem} from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {AbstractListComponent} from '../../../common/abstract-list-component';
import {SideBarComponent} from '../../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../../adminhome-topbar/adminhome-topbar.component';
import {AiNavComponent} from '../ai-nav.component';
import {AiHistorySession} from '../../../models/ai-history-session';
import {AiHistoryService} from '../../../services/ai-history.service';
import {AuthUserService} from '../../../services/auth-user.service';

/** Every user's chat sessions, newest first (Admin; the API scopes anyone else to their own). */
@Component({
    selector: 'ai-history-list',
    standalone: true,
    templateUrl: './ai-history-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, SelectModule,
        TableModule, PrimeTemplate, DatePipe]
})
export class AiHistoryListComponent extends AbstractListComponent<AiHistorySession> implements OnInit {

    private readonly users = inject(AuthUserService);

    /** Keycloak id -> username; sessions only store the id. */
    private usernames = new Map<string, string>();
    userOptions: SelectItem[] = [{label: 'All users', value: ''}];

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AiHistoryService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'ai-history');
        this.filters = new AiHistorySession();
    }

    ngOnInit() {
        super.ngOnInit();
        this.users.getAllList({}).subscribe({
            next: list => {
                for (const u of list ?? []) {
                    this.usernames.set(u.id, u.username);
                }
                this.userOptions = [{label: 'All users', value: ''},
                    ...(list ?? []).map(u => ({label: u.username, value: u.id}))];
                console.log('[ai-history] resolved', this.usernames.size, 'users');
            },
            // not fatal: the list falls back to raw ids
            error: err => console.warn('[ai-history] users not resolved', err)
        });
    }

    username(userId: string): string {
        return this.usernames.get(userId) ?? userId;
    }
}
