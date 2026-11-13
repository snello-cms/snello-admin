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
import {AiSkill} from '../../../models/ai-skill';
import {AiSkillService} from '../../../services/ai-skill.service';

@Component({
    selector: 'ai-skill-list',
    standalone: true,
    templateUrl: './ai-skill-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, SelectModule,
        TableModule, PrimeTemplate]
})
export class AiSkillListComponent extends AbstractAiListComponent<AiSkill> {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AiSkillService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'ai-skills');
        this.filters = new AiSkill();
    }
}
