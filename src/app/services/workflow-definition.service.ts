import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {AbstractService} from '../common/abstract-service';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';
import {WorkflowDefinition} from '../models/workflow-definition';
import {WorkflowValidation} from '../models/workflow-validation';

/**
 * Workflow definitions (Admin / Manager): YAML saved in snello, deployed to the Quarkus Flow runner through
 * flow-bridge (snello -> bridge writes the runner's workflow file and waits until the runner has loaded it).
 */
@Injectable({
    providedIn: 'root'
})
export class WorkflowDefinitionService extends AbstractService<WorkflowDefinition> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getConfiguration().pipe(
            map(config => String(config[API_SERVICE_PATH] ?? '/api') + '/workflowdefinitions')
        ), http, messageService);
    }

    getId(element: WorkflowDefinition) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            _limit: 10
        };
    }

    /** Errors are not routed to handleError: the editor shows them inline while typing, without toasts. */
    validate(yaml: string): Observable<WorkflowValidation> {
        return this.withUrl(() => this.http.post<WorkflowValidation>(this.url + '/validate', {yaml}));
    }

    /** Takes up to ~20 s: flow-bridge waits for the runner's file watcher (every 5 s) to load the workflow. */
    deploy(uuid: string): Observable<WorkflowDefinition> {
        console.log('[workflows] deploy', uuid);
        return this.withUrl(() => this.http.post<WorkflowDefinition>(this.url + '/' + encodeURIComponent(uuid) + '/deploy', {}));
    }

    deployStatus(): Observable<{writes: boolean; workflows: {file: string}[]}> {
        return this.withUrl(() => this.http.get<{writes: boolean; workflows: {file: string}[]}>(this.url + '/deploy-status'));
    }
}
