import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Extension} from "../../model/extension";
import {ExtensionService} from "../../service/extension.service";

@Component(
    {
        templateUrl: './extensions-list.component.html'
    }
)
export class ExtensionsListComponent extends AbstractListComponent<Extension> implements OnInit {


    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: ExtensionService,
        public messageService: MessageService) {
        super(messageService, router, confirmationService, service, 'extensions_admin');

    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }
}
