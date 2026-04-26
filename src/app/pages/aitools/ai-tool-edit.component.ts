import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AiToolService} from '../../services/ai-tool.service';
import {AiTool} from '../../models/ai-tool';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';

type ParameterType = 'string' | 'integer' | 'number' | 'boolean';

type ParameterDraft = {
    name: string;
    type: ParameterType;
    description: string;
    required: boolean;
};

@Component({
    standalone: true,
    templateUrl: './ai-tool-edit.component.html',
    imports: [SideBarComponent, AdminhomeTopBar, ReactiveFormsModule, FormsModule, InputText]
})
export class AiToolEditComponent extends AbstractEditComponent<AiTool>
    implements OnInit {

    parameterCount = 0;
    schemaDescription = '';
    parameterDrafts: ParameterDraft[] = [];
    readonly parameterTypeOptions: ParameterType[] = ['string', 'integer', 'number', 'boolean'];

    constructor(
        router: Router,
        route: ActivatedRoute,
        confirmationService: ConfirmationService,
        aiToolService: AiToolService,
        public messageService: MessageService
    ) {
        super(router, route, confirmationService, aiToolService, messageService, 'aitools');
    }

    createInstance(): AiTool {
        return new AiTool();
    }

    ngOnInit() {
        this.element = new AiTool();
        super.ngOnInit();
    }

    postCreate() {
        this.element.active = true;
        this.syncParameterDrafts();
    }

    postFind() {
        this.element.active = true;
        this.loadSchemaFromElement();
    }

    onSqlQueryChange() {
        this.syncParameterDrafts();
    }

    generateParameterSchema() {
        this.syncParameterDrafts();
        this.element.parameters_schema = JSON.stringify(this.buildSchemaObject(), null, 2);
    }

    preSave(): boolean {
        this.element.active = true;
        this.generateParameterSchema();
        return true;
    }

    preUpdate(): boolean {
        this.element.active = true;
        this.generateParameterSchema();
        return true;
    }

    private countSqlPlaceholders(query?: string): number {
        return (query?.match(/\?/g) ?? []).length;
    }

    private syncParameterDrafts() {
        const count = this.countSqlPlaceholders(this.element?.sql_query);
        this.parameterCount = count;

        if (count === 0) {
            this.parameterDrafts = [];
            return;
        }

        const currentDrafts = [...this.parameterDrafts];
        this.parameterDrafts = Array.from({length: count}, (_, index) => {
            return currentDrafts[index] ?? this.createDefaultParameterDraft(index);
        });
    }

    private createDefaultParameterDraft(index: number): ParameterDraft {
        return {
            name: `param_${index + 1}`,
            type: 'string',
            description: `Parametro ${index + 1}`,
            required: false
        };
    }

    private buildSchemaObject(): Record<string, unknown> {
        if (this.parameterCount === 0) {
            return {
                type: 'object',
                properties: {},
                required: [],
                additionalProperties: false
            };
        }

        const properties: Record<string, {type: ParameterType; description: string}> = {};
        const required: string[] = [];

        this.parameterDrafts.forEach((parameter, index) => {
            const key = this.normalizeParameterName(parameter.name, index);
            properties[key] = {
                type: parameter.type,
                description: parameter.description.trim() || `Parametro ${index + 1}`
            };

            if (parameter.required) {
                required.push(key);
            }
        });

        const schema: Record<string, unknown> = {
            type: 'object',
            properties,
            required,
            additionalProperties: false
        };

        const description = this.schemaDescription.trim();
        if (description) {
            schema['description'] = description;
        }

        return schema;
    }

    private normalizeParameterName(name: string, index: number): string {
        const cleaned = name.trim().replace(/[^a-zA-Z0-9_]/g, '_');
        return cleaned || `param_${index + 1}`;
    }

    private loadSchemaFromElement() {
        this.schemaDescription = '';

        const queryCount = this.countSqlPlaceholders(this.element?.sql_query);

        if (!this.element.parameters_schema) {
            this.syncParameterDrafts();
            return;
        }

        try {
            const parsed = JSON.parse(this.element.parameters_schema) as {
                description?: string;
                properties?: Record<string, {type?: string; description?: string}>;
                required?: string[];
            };

            this.schemaDescription = typeof parsed.description === 'string' ? parsed.description : '';
            const properties = parsed.properties ?? {};
            const requiredSet = new Set(parsed.required ?? []);

            const schemaDrafts = Object.keys(properties).map((key, index) => {
                const property = properties[key] ?? {};
                return {
                    name: key,
                    type: this.toParameterType(property.type),
                    description: property.description ?? `Parametro ${index + 1}`,
                    required: requiredSet.has(key)
                } as ParameterDraft;
            });

            const targetCount = queryCount > 0 ? queryCount : schemaDrafts.length;
            this.parameterCount = targetCount;
            this.parameterDrafts = Array.from({length: targetCount}, (_, index) => {
                return schemaDrafts[index] ?? this.createDefaultParameterDraft(index);
            });
        } catch {
            this.syncParameterDrafts();
        }
    }

    private toParameterType(type?: string): ParameterType {
        if (type === 'integer' || type === 'number' || type === 'boolean' || type === 'string') {
            return type;
        }

        return 'string';
    }
}
