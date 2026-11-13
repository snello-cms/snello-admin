import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';
import {SelectModule} from 'primeng/select';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {SideBarComponent} from '../../sidebar/sidebar.component';
import {AdminhomeTopBar} from '../../adminhome-topbar/adminhome-topbar.component';
import {AiNavComponent} from '../ai-nav.component';
import {AbstractAiEditComponent} from '../../../common/abstract-ai-edit-component';
import {AiSkill} from '../../../models/ai-skill';
import {AiSkillService} from '../../../services/ai-skill.service';

@Component({
    selector: 'ai-skill-edit',
    standalone: true,
    templateUrl: './ai-skill-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, Textarea, SelectModule,
        ToggleSwitchModule]
})
export class AiSkillEditComponent extends AbstractAiEditComponent<AiSkill> {

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public service: AiSkillService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, service, messageService, 'ai-skills');
    }

    createInstance(): AiSkill {
        return new AiSkill();
    }
}
