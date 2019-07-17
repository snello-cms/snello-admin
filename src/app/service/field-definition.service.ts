import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {FieldDefinition} from '../model/field-definition';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {FIELD_DEFINITION_API_PATH} from '../constants/constants';

@Injectable()
export class FieldDefinitionService extends AbstractService<FieldDefinition> {
    constructor(
        protected http: HttpClient,
        messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.get(FIELD_DEFINITION_API_PATH), http, messageService);
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
