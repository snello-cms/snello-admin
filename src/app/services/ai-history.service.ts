import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {AbstractService} from '../common/abstract-service';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';
import {AiHistorySession} from '../models/ai-history-session';
import {AiHistoryEvent} from '../models/ai-history-event';

/**
 * Read-only chat history. scope=all lists every user's sessions (the API honours it for Admin only;
 * anyone else still gets just their own).
 */
@Injectable({providedIn: 'root'})
export class AiHistoryService extends AbstractService<AiHistorySession> {

    constructor(http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getConfiguration().pipe(
            map(config => String(config[API_SERVICE_PATH] ?? '') + '/ai/history/sessions')
        ), http, messageService);
    }

    getId(element: AiHistorySession) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            scope: 'all',
            user_id: '',
            session_id_contains: '',
            _limit: 10
        };
    }

    /** Every event of one session, oldest first. */
    transcript(sessionId: string): Observable<AiHistoryEvent[]> {
        const params = new HttpParams()
            .set('scope', 'all')
            .set('session_id', sessionId)
            .set('_sort', 'occurred_at asc')
            .set('_start', '0')
            .set('_limit', '1000');
        console.log('[ai-history] transcript', sessionId);
        return this.withUrl(() =>
            this.httpClient.get<AiHistoryEvent[]>(this.url.replace(/\/sessions$/, ''), {params}));
    }
}
