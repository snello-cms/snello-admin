import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {Condition} from '../../model/condtion';
import {UrlMapRule} from '../../model/url-map-rule';
import {UrlMapRuleService} from '../../service/url-map-rule.service';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component(
    {
        templateUrl: './urlmaprule-list.component.html',
        styleUrls: ['./urlmaprule-list.component.css']
    }
)
export class UrlmapruleListComponent extends AbstractListComponent<UrlMapRule> implements OnInit {
    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: UrlMapRuleService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'urlmaprules');
        this.filters = new Condition();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }

    postList() {
        super.postList();
    }

}

