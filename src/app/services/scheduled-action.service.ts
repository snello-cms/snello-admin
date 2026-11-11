import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {AbstractService} from '../common/abstract-service';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH, SCHEDULED_ACTIONS_API_PATH} from '../constants/constants';
import {ScheduledAction} from '../models/scheduled-action';
import {CronPreview} from '../models/cron-preview';

@Injectable({
    providedIn: 'root'
})
export class ScheduledActionService extends AbstractService<ScheduledAction> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        // older config.json files have no scheduled_actions_api_path: derive it from api_service_path
        super(configurationService.getConfiguration().pipe(
            map(config => String(config[SCHEDULED_ACTIONS_API_PATH]
                ?? (String(config[API_SERVICE_PATH] ?? '') + '/scheduledactions')))
        ), http, messageService);
    }

    getId(element: ScheduledAction) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            uuid: '',
            enabled: '',
            _limit: 10
        };
    }

    /** Next fire times of a cron, computed by the API (same parser and timezone as the scheduler). */
    preview(frequency: string, count = 5): Observable<CronPreview> {
        const params = new HttpParams().set('frequency', frequency).set('count', String(count));
        return this.withUrl(() => this.http.get<CronPreview>(this.url + '/preview', {params}));
    }

    /** Runs the job now; resolves to the stored outcome (last_status, last_message, last_duration_ms). */
    runNow(uuid: string): Observable<ScheduledAction> {
        return this.withUrl(() => this.http.post<ScheduledAction>(this.url + '/' + uuid + '/run', {}));
    }
}
