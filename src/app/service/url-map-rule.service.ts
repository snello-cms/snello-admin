import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {URL_MAP_RULES_API_PATH} from '../../constants';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {UrlMapRule} from "../model/url-map-rule";

@Injectable()
export class UrlMapRuleService extends AbstractService<UrlMapRule> {

    constructor(protected http: HttpClient, messageService: MessageService) {
        super(URL_MAP_RULES_API_PATH, http, messageService);
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


