import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Metadata} from '../model/metadata';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {DRAGGABLE_API_PATH} from '../constants/constants';
import { Draggable } from '../model/draggable';

@Injectable({
    providedIn: 'root'
})
export class DraggableService extends AbstractService<Draggable> {
    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(DRAGGABLE_API_PATH), http, messageService);
    }

    private nameToMetadata: Map<string, Metadata> = new Map();

    getId(element: Draggable) {
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
