import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {AbstractService} from './abstract-service';
import {ConfigurationService} from '../services/configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';

/**
 * CRUD on one /api/ai/{resource} of snello-api (projects, skills, mcp-tools, cards, service-accounts).
 * The URL is derived from api_service_path, so config.json needs no new keys.
 * When {@link activeProjectUuid} is given, list searches start filtered on the active project.
 */
export abstract class AbstractAiService<T extends { uuid: string }> extends AbstractService<T> {

    protected constructor(resource: string,
                          http: HttpClient,
                          messageService: MessageService,
                          configurationService: ConfigurationService,
                          private readonly activeProjectUuid?: () => string) {
        super(configurationService.getConfiguration().pipe(
            map(config => String(config[API_SERVICE_PATH] ?? '') + '/ai/' + resource)
        ), http, messageService);
        // super() ran buildSearch before activeProjectUuid was assigned: rebuild with the project filter
        this.buildSearch();
    }

    /** Rows of this resource in one project (x-total-count of a 1-row page); does not touch the list state. */
    countByProject(projectUuid: string): Observable<number> {
        const params = new HttpParams().set('project_uuid', projectUuid).set('_start', '0').set('_limit', '1');
        return this.withUrl(() => this.httpClient.get(this.url, {params, observe: 'response'}).pipe(
            map(res => +(res.headers.get('x-total-count') ?? 0))
        ));
    }

    getId(element: T) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            _limit: 10
        };
        if (this.activeProjectUuid) {
            this.search.project_uuid = this.activeProjectUuid() ?? '';
        }
    }
}
