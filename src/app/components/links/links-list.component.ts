import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Link} from '../../model/link';
import {LinksService} from '../../service/links.service';

@Component(
    {
        templateUrl: './links-list.component.html',
        styleUrls: ['./links-list.component.css']
    }
)
export class LinksListComponent extends AbstractListComponent<Link> implements OnInit {
    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: LinksService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'links');
        this.filters = new Link();
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

    getId(): any {
        return this.element.name;
    }

    public createTable(link: Link) {
        this.service.create(link).subscribe();
    }
}

