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
import {AiUiCard} from '../../../models/ai-ui-card';
import {AiUiCardService} from '../../../services/ai-ui-card.service';

@Component({
    selector: 'ai-ui-card-list',
    standalone: true,
    templateUrl: './ai-ui-card-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, SelectModule,
        TableModule, PrimeTemplate]
})
export class AiUiCardListComponent extends AbstractAiListComponent<AiUiCard> {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AiUiCardService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'ai-cards');
        this.filters = new AiUiCard();
    }
}
