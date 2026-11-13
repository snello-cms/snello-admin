import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {forkJoin} from 'rxjs';
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
import {AbstractEditComponent} from '../../../common/abstract-edit-component';
import {AiProject} from '../../../models/ai-project';
import {AiProjectService} from '../../../services/ai-project.service';
import {AiProjectContextService} from '../../../services/ai-project-context.service';
import {AiSkillService} from '../../../services/ai-skill.service';
import {AiMcpToolService} from '../../../services/ai-mcp-tool.service';
import {AiUiCardService} from '../../../services/ai-ui-card.service';
import {AiServiceAccountService} from '../../../services/ai-service-account.service';

type ProjectPart = { path: string; label: string; count: number | null };

@Component({
    selector: 'ai-project-edit',
    standalone: true,
    templateUrl: './ai-project-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, Textarea, SelectModule,
        ToggleSwitchModule, RouterLink]
})
export class AiProjectEditComponent extends AbstractEditComponent<AiProject> {

    private readonly projectContext = inject(AiProjectContextService);
    private readonly skills = inject(AiSkillService);
    private readonly tools = inject(AiMcpToolService);
    private readonly cards = inject(AiUiCardService);
    private readonly accounts = inject(AiServiceAccountService);

    parts: ProjectPart[] = [
        {path: 'ai-skills', label: 'Skills', count: null},
        {path: 'ai-mcptools', label: 'MCP tools', count: null},
        {path: 'ai-cards', label: 'Cards', count: null},
        {path: 'ai-serviceaccounts', label: 'Service accounts', count: null}
    ];

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public service: AiProjectService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, service, messageService, 'ai-projects');
    }

    createInstance(): AiProject {
        return new AiProject();
    }

    postFind() {
        const uuid = this.element.uuid;
        console.log('[ai-project] loaded', uuid, this.element.name);
        forkJoin([
            this.skills.countByProject(uuid),
            this.tools.countByProject(uuid),
            this.cards.countByProject(uuid),
            this.accounts.countByProject(uuid)
        ]).subscribe(counts => {
            counts.forEach((count, i) => this.parts[i].count = count);
            console.log('[ai-project] parts of', uuid, counts);
        });
    }

    hasParts(): boolean {
        return this.parts.some(p => (p.count ?? 0) > 0);
    }

    /** Following a part link works on this project. */
    openPart() {
        this.projectContext.select(this.element.uuid);
    }

    postSave() {
        this.projectContext.load().subscribe(() => this.projectContext.select(this.element.uuid));
    }

    postUpdate() {
        this.projectContext.load().subscribe();
    }

    postDelete() {
        this.projectContext.load().subscribe();
    }
}
