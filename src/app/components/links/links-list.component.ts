import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {Link} from '../../model/link';
import {LinksService} from '../../service/links.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
    templateUrl: './links-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
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

