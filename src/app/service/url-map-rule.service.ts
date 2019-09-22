import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {UrlMapRule} from '../model/url-map-rule';
import {ConfigurationService} from './configuration.service';
import {URL_MAP_RULES_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class UrlMapRuleService extends AbstractService<UrlMapRule> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(URL_MAP_RULES_API_PATH), http, messageService);
    }

    getId(element: UrlMapRule) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            pattern_contains: '',
            uuid: '',
            http_methods: '',
            _limit: 10
        };
    }
}


