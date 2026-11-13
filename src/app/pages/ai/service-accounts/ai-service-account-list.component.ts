import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService, PrimeTemplate} from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {AbstractAiListComponent} from '../../../common/abstract-ai-list-component';
import {SideBarComponent} from '../../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../../adminhome-topbar/adminhome-topbar.component';
import {AiNavComponent} from '../ai-nav.component';
import {AiServiceAccount} from '../../../models/ai-service-account';
import {AiServiceAccountService} from '../../../services/ai-service-account.service';

@Component({
    selector: 'ai-service-account-list',
    standalone: true,
    templateUrl: './ai-service-account-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, SelectModule,
        TableModule, PrimeTemplate]
})
export class AiServiceAccountListComponent extends AbstractAiListComponent<AiServiceAccount> {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AiServiceAccountService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'ai-serviceaccounts');
        this.filters = new AiServiceAccount();
    }
}
