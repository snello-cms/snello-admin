import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {Draggable} from 'src/app/model/draggable';
import {DraggableService} from 'src/app/service/draggable.service';
import {Droppable} from '../../model/droppable';
import {DroppableService} from '../../service/droppable.service';

@Component(
    {
        templateUrl: './droppable-edit.component.html',
        styleUrls: ['./droppable-edit.component.css']
    }
)
export class DroppableEditComponent extends AbstractEditComponent<Droppable> implements OnInit {

    draggables = [];
    draggableSelect: SelectItem[] = [];
    mapDraggable: Map<string, Draggable> = new Map();

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public theService: DroppableService,
        public draggableService: DraggableService,
        public metadataService: MetadataService
    ) {
        super(router, route, confirmationService, theService, 'droppables');
        this.draggableService.getAllList().subscribe(result => {
            for (const draggable of result) {
                this.mapDraggable.set(draggable.name, draggable);
                this.draggableSelect.push({value: draggable.uuid, label: draggable.name});
            }
        });
    }

    ngOnInit() {
        this.element = new Droppable();
        super.ngOnInit();
    }


    createInstance(): Droppable {
        return new Droppable();
    }

}

