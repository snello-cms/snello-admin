import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {AbstractAiService} from '../common/abstract-ai-service';
import {ConfigurationService} from './configuration.service';
import {AiProject} from '../models/ai-project';

@Injectable({providedIn: 'root'})
export class AiProjectService extends AbstractAiService<AiProject> {
    constructor(http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super('projects', http, messageService, configurationService);
    }
}
