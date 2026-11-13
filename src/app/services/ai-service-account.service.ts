import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {AbstractAiService} from '../common/abstract-ai-service';
import {ConfigurationService} from './configuration.service';
import {AiProjectContextService} from './ai-project-context.service';
import {AiServiceAccount} from '../models/ai-service-account';

@Injectable({providedIn: 'root'})
export class AiServiceAccountService extends AbstractAiService<AiServiceAccount> {
    constructor(http: HttpClient, messageService: MessageService, configurationService: ConfigurationService,
                projectContext: AiProjectContextService) {
        super('service-accounts', http, messageService, configurationService, () => projectContext.activeUuid());
    }

    /** The API never returns client_secret; an empty one is left out so an update keeps the stored secret. */
    protected marshall(element: AiServiceAccount) {
        const body: Partial<AiServiceAccount> = {...element};
        if (!body.client_secret) {
            delete body.client_secret;
        }
        return body as AiServiceAccount;
    }
}
