import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Draggable} from 'src/app/model/draggable';
import {DraggableService} from 'src/app/service/draggable.service';

@Component(
    {
        templateUrl: './draggable-edit.component.html',
        styleUrls: ['./draggable-edit.component.css']
    }
)
export class DraggableEditComponent extends AbstractEditComponent<Draggable> implements OnInit {

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public theService: DraggableService,
        public metadataService: MetadataService,
        public messageService: MessageService,
    ) {
        super(router, route, confirmationService, theService, messageService, 'draggables');

    }

    ngOnInit() {
        this.element = new Draggable();
        super.ngOnInit();
    }


    createInstance(): Draggable {
        return new Draggable();
    }

}

