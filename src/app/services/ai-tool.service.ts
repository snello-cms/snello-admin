import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {AiTool} from '../models/ai-tool';
import {ConfigurationService} from './configuration.service';
import {AI_TOOLS_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class AiToolService extends AbstractService<AiTool> {
    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(AI_TOOLS_API_PATH), http, messageService);
    }

    getId(element: AiTool) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            uuid: '',
            _limit: 10
        };
    }
}
