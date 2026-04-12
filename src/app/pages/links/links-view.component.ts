import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../models/metadata';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractViewComponent} from '../../common/abstract-view-component';
import {FieldDefinitionService} from '../../services/field-definition.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Link} from '../../models/link';
import {LinksService} from '../../services/links.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';

@Component({
    standalone: true,
    templateUrl: './links-view.component.html',
    imports: [SideBarComponent, AdminhomeTopBar]
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
