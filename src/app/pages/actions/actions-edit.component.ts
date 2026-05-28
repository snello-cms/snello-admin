import {Component, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {Action} from '../../models/action';
import {ActionService} from '../../services/action.service';
import {MetadataService} from '../../services/metadata.service';
import {Metadata} from '../../models/metadata';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {SideBarComponent} from '../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../adminhome-topbar/adminhome-topbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectModule} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';

@Component({
    standalone: true,
    templateUrl: './actions-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, SelectModule, InputText, Textarea]
})
export class ActionsEditComponent extends AbstractEditComponent<Action> implements OnInit {

    metadatasSelect: SelectItem[] = [];
    conditionItems: SelectItem[] = [
        {value: 'PERSIST', label: 'PERSIST'},
        {value: 'MERGE', label: 'MERGE'},
        {value: 'DELETE', label: 'DELETE'}
    ];

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public actionService: ActionService,
        public messageService: MessageService,
        public metadataService: MetadataService
    ) {
        super(router, route, confirmationService, actionService, messageService, 'actions');
    }

    ngOnInit() {
        this.element = new Action();
        this.metadataService.getList().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            metadataList => this.valorizeMetadatas(metadataList)
        );
        super.ngOnInit();
    }

    valorizeMetadatas(metadataList: Metadata[]) {
        this.metadatasSelect = [];
        for (const meta of metadataList) {
            this.metadatasSelect.push({value: meta.table_name, label: meta.table_name});
        }
    }

    createInstance(): Action {
        return new Action();
    }
}
