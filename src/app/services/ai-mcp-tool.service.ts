import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {AbstractAiService} from '../common/abstract-ai-service';
import {ConfigurationService} from './configuration.service';
import {AiProjectContextService} from './ai-project-context.service';
import {AiMcpTool} from '../models/ai-mcp-tool';

@Injectable({providedIn: 'root'})
export class AiMcpToolService extends AbstractAiService<AiMcpTool> {
    constructor(http: HttpClient, messageService: MessageService, configurationService: ConfigurationService,
                projectContext: AiProjectContextService) {
        super('mcp-tools', http, messageService, configurationService, () => projectContext.activeUuid());
    }
}
