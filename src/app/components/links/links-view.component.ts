import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../model/metadata';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {FieldDefinitionService} from '../../service/field-definition.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Link} from '../../model/link';
import {LinksService} from '../../service/links.service';

@Component({
    templateUrl: './links-view.component.html'
})
export class LinksViewComponent extends AbstractViewComponent<Link>
    implements OnInit {

    constructor(
        router: Router,
        route: ActivatedRoute,
        public linksService: LinksService,
        public confirmationService: ConfirmationService,
        protected messageService: MessageService,
        public fieldDefinitionService: FieldDefinitionService
    ) {
        super(router, route, linksService, messageService, 'links');
        this.element = new Link();
    }

    createInstance(): Metadata {
        return new Metadata();
    }

    ngOnInit() {
        this.element = new Link();
        super.ngOnInit();
    }

    getId() {
        return this.element.name;
    }

    public edit() {
        this.router.navigate(['/' + this.path + '/edit', this.getId()]);
    }

}
