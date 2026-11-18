import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {AbstractService} from '../common/abstract-service';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH} from '../constants/constants';
import {WorkflowPage} from '../models/workflow-page';

@Injectable({
    providedIn: 'root'
})
export class WorkflowPageService extends AbstractService<WorkflowPage> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getConfiguration().pipe(
            map(config => String(config[API_SERVICE_PATH] ?? '/api') + '/workflowpages')
        ), http, messageService);
    }

    getId(element: WorkflowPage) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            _limit: 10
        };
    }
}
