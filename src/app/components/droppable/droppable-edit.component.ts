import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
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
    draggable: string;
    variables: { name, draggable, value }[] = [];
    dynamics: { name, draggable, value }[] = [];

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public theService: DroppableService,
        public draggableService: DraggableService,
        public metadataService: MetadataService,
        public messageService: MessageService,

    ) {
        super(router, route, confirmationService, theService, messageService, 'droppables');
        this.draggableService.getAllList().subscribe(result => {
            for (const draggable of result) {
                this.mapDraggable.set(draggable.uuid, draggable);
                this.draggableSelect.push({value: draggable.uuid, label: draggable.name});
            }
        });
    }

    ngOnInit() {
        this.element = new Droppable();
        super.ngOnInit();
    }


    addDraggable() {
        if (!this.element.draggables) {
            this.element.draggables = '';
        }
        if (!this.element.html) {
            this.element.html = '';
        }
        if (this.draggable && this.mapDraggable.has(this.draggable)) {
            const draggableScelto = this.mapDraggable.get(this.draggable);
            if (this.element.draggables && this.element.draggables.length > 0) {
                this.element.draggables += ',';
            }
            this.element.draggables += draggableScelto.uuid;
            if (this.element.html && this.element.html.length > 0) {
                this.element.html += '\n';
            }
            this.element.html += draggableScelto.template;
            if (draggableScelto.static_vars) {
                for (const variable of draggableScelto.static_vars.split(';')) {
                    this.variables.push({name: variable, draggable: draggableScelto.uuid, value: ''});
                }
            }
            if (draggableScelto.dynamic_vars) {
                for (const dyn of draggableScelto.dynamic_vars.split(';')) {
                    this.dynamics.push({name: dyn, draggable: draggableScelto.uuid, value: ''});
                }
            }
        }
    }

    createInstance(): Droppable {
        return new Droppable();
    }

}

