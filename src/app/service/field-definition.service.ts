import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {FieldDefinition} from '../model/field-definition';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {FIELD_DEFINITION_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class FieldDefinitionService extends AbstractService<FieldDefinition> {
    constructor(
        protected http: HttpClient,
        messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(FIELD_DEFINITION_API_PATH), http, messageService);
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

    public fetchFirstLabel(fieldDefinition: FieldDefinition): string {
        const splittedFields = fieldDefinition.join_table_select_fields.split(',');
        let labelField = splittedFields[0];
        if (labelField === fieldDefinition.join_table_key && splittedFields.length > 1) {
            labelField = splittedFields[1];
        }
        return labelField;
    }
}
