import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {AbstractAiService} from '../common/abstract-ai-service';
import {ConfigurationService} from './configuration.service';
import {AiProjectContextService} from './ai-project-context.service';
import {AiSkill} from '../models/ai-skill';

@Injectable({providedIn: 'root'})
export class AiSkillService extends AbstractAiService<AiSkill> {
    constructor(http: HttpClient, messageService: MessageService, configurationService: ConfigurationService,
                projectContext: AiProjectContextService) {
        super('skills', http, messageService, configurationService, () => projectContext.activeUuid());
    }
}
