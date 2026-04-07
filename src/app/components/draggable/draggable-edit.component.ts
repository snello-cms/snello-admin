import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {MetadataService} from '../../service/metadata.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Draggable} from '../../model/draggable';
import {DraggableService} from '../../service/draggable.service';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
    templateUrl: './draggable-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, InputTextarea]
})
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

