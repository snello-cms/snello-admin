import {ChangeDetectionStrategy, Component, DoCheck, inject} from '@angular/core';
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
import {AiUiCard} from '../../../models/ai-ui-card';
import {AiMcpTool} from '../../../models/ai-mcp-tool';
import {AiUiCardService} from '../../../services/ai-ui-card.service';
import {AiMcpToolService} from '../../../services/ai-mcp-tool.service';

@Component({
    selector: 'ai-ui-card-edit',
    standalone: true,
    templateUrl: './ai-ui-card-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, Textarea, SelectModule,
        ToggleSwitchModule]
})
export class AiUiCardEditComponent extends AbstractAiEditComponent<AiUiCard> implements DoCheck {

    private readonly tools = inject(AiMcpToolService);

    /** Distinct result types of the project's tools, suggested in the result type field. */
    toolResultTypes: string[] = [];
    private projectTools: AiMcpTool[] = [];
    private toolsOfProject = '';

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public service: AiUiCardService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, service, messageService, 'ai-cards');
    }

    createInstance(): AiUiCard {
        return new AiUiCard();
    }

    /** Follows the project select to suggest that project's tool result types. */
    ngDoCheck() {
        const project = this.element?.project_uuid;
        if (project && project !== this.toolsOfProject) {
            this.toolsOfProject = project;
            this.tools.getAllList({project_uuid: project}).subscribe(list => {
                this.projectTools = list ?? [];
                this.toolResultTypes = [...new Set(this.projectTools.map(t => t.result_type).filter(Boolean))].sort();
                console.log('[ai-card] project', project, 'tools', this.projectTools.length, 'result types', this.toolResultTypes);
            });
        }
    }

    /** Names of the project's tools whose result this card renders. */
    producers(): string[] {
        return this.projectTools.filter(t => t.result_type === this.element.result_type).map(t => t.name);
    }
}
