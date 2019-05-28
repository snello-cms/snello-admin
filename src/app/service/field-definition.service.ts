import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FIELD_DEFINITION_API_PATH} from '../../constants';
import {AbstractService} from '../common/abstract-service';
import {FieldDefinition} from '../model/field-definition';
import {MessageService} from 'primeng/api';

@Injectable()
export class FieldDefinitionService extends AbstractService<FieldDefinition> {
  constructor(
      protected http: HttpClient,
      messageService: MessageService) {
    super(FIELD_DEFINITION_API_PATH, http, messageService);
  }

  getId(element: FieldDefinition) {
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
