import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {EXTENSION_API_PATH} from '../constants/constants';
import {Extension} from '../model/extension';

@Injectable({
    providedIn: 'root'
})
export class ExtensionService extends AbstractService<Extension> {

    extensionsMap: Map<string, Extension> = new Map();

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(EXTENSION_API_PATH), http, messageService);
    }

    getId(element: Extension) {
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

    public setLoaded(extension: Extension) {
        this.extensionsMap.set(extension.uuid, extension);
    }

    contains(uuid: string) {
        if (this.extensionsMap.has(uuid)) {
            return this.extensionsMap.get(uuid);
        }
        return null;
    }
}


