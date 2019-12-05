import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {UrlMapRule} from "../../model/url-map-rule";
import {UrlMapRuleService} from "../../service/url-map-rule.service";

@Component(
    {
        templateUrl: './urlmaprule-edit.component.html',
        styleUrls: ['./urlmaprule-edit.component.css']
    }
)
export class UrlmapruleEditComponent extends AbstractEditComponent<UrlMapRule> implements OnInit {

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public urlMapRuleService: UrlMapRuleService,
        public messageService: MessageService) {
        super(router, route, confirmationService, urlMapRuleService, messageService, 'urlmaprules');

    }

    public httpMethodsSelect: SelectItem[] = [
        {value: 'GET', label: 'GET'},
        {value: 'DELETE', label: 'DELETE'},
        {value: 'PUT', label: 'PUT'},
        {value: 'POST', label: 'POST'}
    ];

    ngOnInit() {
        this.element = new UrlMapRule();
        super.ngOnInit();
    }

    createInstance(): UrlMapRule {
        return new UrlMapRule();
    }

}

