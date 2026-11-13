import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {AbstractAiService} from '../common/abstract-ai-service';
import {ConfigurationService} from './configuration.service';
import {AiProjectContextService} from './ai-project-context.service';
import {AiUiCard} from '../models/ai-ui-card';

@Injectable({providedIn: 'root'})
export class AiUiCardService extends AbstractAiService<AiUiCard> {
    constructor(http: HttpClient, messageService: MessageService, configurationService: ConfigurationService,
                projectContext: AiProjectContextService) {
        super('cards', http, messageService, configurationService, () => projectContext.activeUuid());
    }
}
