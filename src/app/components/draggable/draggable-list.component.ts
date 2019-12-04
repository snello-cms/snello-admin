import {Component, OnInit} from '@angular/core';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Draggable} from 'src/app/model/draggable';
import {DraggableService} from 'src/app/service/draggable.service';

@Component(
    {
        templateUrl: './draggable-list.component.html',
        styleUrls: ['./draggable-list.component.css']
    }
)
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

