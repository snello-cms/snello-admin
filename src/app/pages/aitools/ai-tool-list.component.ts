import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {AbstractListComponent} from '../../common/abstract-list-component';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AiToolService} from '../../services/ai-tool.service';
import {AiTool} from '../../models/ai-tool';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
    standalone: true,
    templateUrl: './ai-tool-list.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText, TableModule, PrimeTemplate]
})
export class AiToolListComponent extends AbstractListComponent<AiTool> implements OnInit {

    constructor(
        public  router: Router,
        public confirmationService: ConfirmationService,
        public service: AiToolService,
        public messageService: MessageService) {

        super(messageService, router, confirmationService, service, 'aitools');
        this.filters = new AiTool();
    }

    postList() {
        super.postList();
    }

    ngOnInit() {
        this.service.buildSearch();
        this.firstReload = true;
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }
}
