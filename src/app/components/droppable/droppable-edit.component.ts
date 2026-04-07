import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {Draggable} from '../../model/draggable';
import {DraggableService} from '../../service/draggable.service';
import {Droppable} from '../../model/droppable';
import {DroppableService} from '../../service/droppable.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

type VariableEntry = { name: string; draggable: string; value: string };

@Component({
    templateUrl: './droppable-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, SelectModule, Textarea]
})
export class DroppableEditComponent extends AbstractEditComponent<Droppable> implements OnInit {

    draggables: Draggable[] = [];
    draggableSelect: SelectItem[] = [];
    mapDraggable: Map<string, Draggable> = new Map();
    draggable = '';
    variables: VariableEntry[] = [];
    dynamics: VariableEntry[] = [];

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
            if (!draggableScelto) {
                return;
            }
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

