import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {Draggable} from '../../model/draggable';
import {DraggableService} from '../../service/draggable.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

@Component({
    templateUrl: './draggable-list.component.html',
    host: { 'data-cmp-id': 'draggable-list' },
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, TableModule, PrimeTemplate]
})
export class DraggableListComponent extends AbstractListComponent<Draggable> implements OnInit {


    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public draggableService: DraggableService,
        public metadataService: MetadataService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, draggableService, 'draggables');
        this.filters = new Draggable();
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

