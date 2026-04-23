import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ChatInteraction} from '../models/chat-interaction';
import {CHATINTERACTIONS_API_PATH} from '../constants/constants';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class ChatInteractionService extends AbstractService<ChatInteraction> {

  constructor(
    protected http: HttpClient,
    messageService: MessageService,
    configurationService: ConfigurationService
  ) {
    super(configurationService.getValue(CHATINTERACTIONS_API_PATH), http, messageService);
  }

  getId(element: ChatInteraction) {
    return element.uuid;
  }

  buildSearch() {
    this.search = {
      conversation_uuid: '',
      user_id: '',
      creation_date_gt: '',
      creation_date_lt: '',
      _limit: 10
    };
  }
}
