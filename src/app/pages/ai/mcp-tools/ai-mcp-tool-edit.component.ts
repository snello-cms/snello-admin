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
import {AiMcpTool} from '../../../models/ai-mcp-tool';
import {AiMcpToolService} from '../../../services/ai-mcp-tool.service';
import {AiServiceAccountService} from '../../../services/ai-service-account.service';

/** JSON fields of a tool; parameters_json is required, the others optional. */
const JSON_FIELDS: { field: keyof AiMcpTool; label: string; required: boolean }[] = [
    {field: 'parameters_json', label: 'Parameters', required: true},
    {field: 'arg_names_json', label: 'Argument names', required: false},
    {field: 'fixed_query_json', label: 'Fixed query', required: false}
];

@Component({
    selector: 'ai-mcp-tool-edit',
    standalone: true,
    templateUrl: './ai-mcp-tool-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideBarComponent, AdminhomeTopBar, AiNavComponent, ReactiveFormsModule, FormsModule, InputText, Textarea, SelectModule,
        ToggleSwitchModule]
})
export class AiMcpToolEditComponent extends AbstractAiEditComponent<AiMcpTool> implements DoCheck {

    private readonly accounts = inject(AiServiceAccountService);

    methods: SelectItem[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => ({label: m, value: m}));
    bindings: SelectItem[] = [
        {label: 'Query string', value: 'QUERY'},
        {label: 'JSON body', value: 'BODY'}
    ];
    serviceAccountOptions: SelectItem[] = [];
    jsonErrors: string[] = [];
    private accountsOfProject = '';

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public service: AiMcpToolService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, service, messageService, 'ai-mcptools');
    }

    createInstance(): AiMcpTool {
        return new AiMcpTool();
    }

    postFind() {
        super.postFind();
        this.checkJson();
    }

    /** The project select is a plain ngModel: follow it to offer that project's service accounts. */
    ngDoCheck() {
        if (this.element?.project_uuid && this.element.project_uuid !== this.accountsOfProject) {
            this.loadServiceAccounts(this.element.project_uuid);
        }
    }

    private loadServiceAccounts(projectUuid: string) {
        if (!projectUuid || projectUuid === this.accountsOfProject) {
            return;
        }
        this.accountsOfProject = projectUuid;
        this.accounts.getAllList({project_uuid: projectUuid}).subscribe(list => {
            this.serviceAccountOptions = (list ?? []).map(a => ({label: a.name + ' (' + a.client_id + ')', value: a.uuid}));
            console.log('[ai-mcp-tool] service accounts of project', projectUuid, this.serviceAccountOptions.length);
        });
    }

    checkJson() {
        this.jsonErrors = [];
        for (const {field, label, required} of JSON_FIELDS) {
            const value = (this.element[field] as string | undefined)?.trim();
            if (!value) {
                if (required) {
                    this.jsonErrors.push(label + ': required');
                }
                continue;
            }
            try {
                const parsed = JSON.parse(value);
                if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    this.jsonErrors.push(label + ': must be a JSON object');
                }
            } catch (e) {
                this.jsonErrors.push(label + ': ' + (e as Error).message);
            }
        }
    }

    private valid(): boolean {
        this.checkJson();
        if (this.element.authenticated && !this.element.service_account_uuid) {
            this.jsonErrors.push('Authenticated tools need a service account');
        }
        if (this.jsonErrors.length) {
            console.log('[ai-mcp-tool] not saved:', this.jsonErrors);
            this.addError(this.jsonErrors.join('; '));
            return false;
        }
        if (!this.element.authenticated) {
            this.element.service_account_uuid = '';
        }
        return true;
    }

    preSave(): boolean {
        return this.valid();
    }

    preUpdate(): boolean {
        return this.valid();
    }
}
