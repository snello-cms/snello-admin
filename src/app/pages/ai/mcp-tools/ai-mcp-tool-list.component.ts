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
import {AiMcpTool} from '../../../models/ai-mcp-tool';
import {AiMcpToolService} from '../../../services/ai-mcp-tool.service';

@Component({
    selector: 'ai-mcp-tool-list',
    standalone: true,
    templateUrl: './ai-mcp-tool-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, SelectModule,
        TableModule, PrimeTemplate]
})
export class AiMcpToolListComponent extends AbstractAiListComponent<AiMcpTool> {

    constructor(
        public router: Router,
        public confirmationService: ConfirmationService,
        public service: AiMcpToolService,
        public messageService: MessageService
    ) {
        super(messageService, router, confirmationService, service, 'ai-mcptools');
        this.filters = new AiMcpTool();
    }
}
