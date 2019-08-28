import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {Droppable} from '../model/droppable';
import {DROPPABLE_API_PATH} from '../constants/constants';
import {ConfigurationService} from './configuration.service';
import {Metadata} from '../model/metadata';

@Injectable()
export class DroppableService extends AbstractService<Droppable> {
    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.get(DROPPABLE_API_PATH), http, messageService);
    }

    private nameToMetadata: Map<string, Metadata> = new Map();

    getId(element: Droppable) {
        return element.uuid;
    }


    buildSearch() {
        this.search = {
            table_name_contains: '',
            uuid: '',
            _limit: 10
        };
    }

}

