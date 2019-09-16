import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Condition} from '../model/condtion';
import {CONDITION_API_PATH} from '../constants/constants';
import {AbstractService} from '../common/abstract-service';
import { MessageService } from 'primeng/api';
import {ConfigurationService} from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class ConditionService extends AbstractService<Condition> {

  constructor(protected http: HttpClient,
    messageService: MessageService,
    configurationService: ConfigurationService) {
    super(configurationService.getValue(CONDITION_API_PATH), http, messageService);
  }

  getId(element: Condition) {
    return element.uuid;
  }

  buildSearch() {
    this.search = {
      name_contains: '',
      uuid: '',
      metadata_uuid: '',
      _limit: 10
    };
  }
}


