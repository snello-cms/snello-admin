import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {AbstractListComponent} from '../../../common/abstract-list-component';
import {SideBarComponent} from '../../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../../adminhome-topbar/adminhome-topbar.component';
import {AiNavComponent} from '../ai-nav.component';
import {AiProject} from '../../../models/ai-project';
import {AiProjectService} from '../../../services/ai-project.service';

@Component({
    selector: 'ai-project-list',
    standalone: true,
    templateUrl: './ai-project-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, SelectModule,
        TableModule, PrimeTemplate]
})
export class AiProjectListComponent extends AbstractListComponent<AiProject> {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AiProjectService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'ai-projects');
        this.filters = new AiProject();
    }

    public new() {
        this.router.navigate(['/' + this.path + '/new']);
    }
}
