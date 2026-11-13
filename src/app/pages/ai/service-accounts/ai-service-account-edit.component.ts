import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {SideBarComponent} from '../../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../../adminhome-topbar/adminhome-topbar.component';
import {AiNavComponent} from '../ai-nav.component';
import {AbstractAiEditComponent} from '../../../common/abstract-ai-edit-component';
import {AiServiceAccount} from '../../../models/ai-service-account';
import {AiServiceAccountService} from '../../../services/ai-service-account.service';

@Component({
    selector: 'ai-service-account-edit',
    standalone: true,
    templateUrl: './ai-service-account-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, SelectModule,
        ToggleSwitchModule]
})
export class AiServiceAccountEditComponent extends AbstractAiEditComponent<AiServiceAccount> {

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public service: AiServiceAccountService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, service, messageService, 'ai-serviceaccounts');
    }

    createInstance(): AiServiceAccount {
        return new AiServiceAccount();
    }
}
