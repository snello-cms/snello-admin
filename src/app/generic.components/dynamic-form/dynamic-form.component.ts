import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
    selector: 'dynamic-form',
    template: `
        <form class="dynamic-form" [formGroup]="form" (submit)="onSubmit($event)">

            <div *ngIf="!groupToFields">
                <ng-container *ngFor="let field of fields;" dynamicField [field]="field" [group]="form" [view]="view">
                </ng-container>
            </div>

            <p-tabView *ngIf="tabs">
                <p-tabPanel [header]="tab" *ngFor="let tab of tabs; let i = index" [selected]="i == 0">
                    <div *ngIf="groupToFields.get(tab)">
                        <ng-container *ngFor="let field of groupToFields.get(tab);" dynamicField [field]="field"
                                [group]="form" [view]="view">
                        </ng-container>
                    </div>
                    <div *ngIf="!groupToFields.get(tab)">
                        <ng-container *ngFor="let group of tabToGroups.get(tab);">
                            <p-fieldset [legend]="group">
                                <ng-container *ngFor="let field of groupToFields.get(group);" dynamicField [field]="field"
                                        [group]="form" [view]="view">
                                </ng-container>
                            </p-fieldset>
                        </ng-container>
                    </div>
                </p-tabPanel>
            </p-tabView>

            <div *ngIf="groups">
                <ng-container *ngFor="let group of groups;">
                    <p-fieldset [legend]="group">
                        <ng-container *ngFor="let field of groupToFields.get(group);" dynamicField [field]="field"
                                [group]="form" [view]="view">
                        </ng-container>
                    </p-fieldset>
                </ng-container>
            </div>

        </form>
    `,
    styles: []
})
export class DynamicFormComponent implements OnInit {

    constructor(private fb: FormBuilder) {
    }

    get value() {
        return this.form.value;
    }

    @Input() fields: FieldDefinition[] = [];
    @Input() view = false;
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    form: FormGroup;

    tabs: Set<string> = null;
    groups: Set<string> = null;
    tabToGroups: Map<string, Set<string>> = new Map();
    groupToFields: Map<string, FieldDefinition[]> = null;

    ngOnInit() {

        this.tabs = null;
        this.groups = null;

        for (const field of this.fields) {

            // ho un tab e dei gruppi
            if (field.tab_name && field.group_name) {
                this.mapGroupOnTab(field.tab_name, field.group_name);
                this.addFieldDefinitionToGroup(field.group_name, field);
            }

            // ho un tab senza gruppi
            if (field.tab_name && !field.group_name) {
                this.addTab(field.tab_name);
                this.addFieldDefinitionToGroup(field.tab_name, field);
            }

            // se non ho tab devo avere solo gruppi
            if (!field.tab_name && field.group_name) {
                this.addGroup(field.group_name);
                this.addFieldDefinitionToGroup(field.group_name, field);
            }
        }

        this.form = this.createControl();
    }


    createControl() {
        const group = this.fb.group({});
        this.fields.forEach(field => {
            const control = this.fb.control(
                field.value, this.bindValidations(field.validations || [])
            );
            group.addControl(field.name, control);
        });
        return group;
    }

    bindValidations(validations: any) {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);
        }
        return null;
    }

    onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.form.valid) {
            this.submit.emit(this.form.value);
        } else {
            this.validateAllFormFields(this.form);
        }
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            control.markAsTouched({onlySelf: true});
        });
    }

    private mapGroupOnTab(tab_name: string, group_name: string) {
        this.addTab(tab_name);
        let groups = this.tabToGroups.get(tab_name);
        if (!groups) {
            groups = new Set();
        }
        groups.add(group_name);
        this.tabToGroups.set(tab_name, groups);
    }

    private addTab(tab_name: string) {
        if (!this.tabs) {
            this.tabs = new Set();
        }
        this.tabs.add(tab_name);
    }

    private addGroup(group_name: string) {
        if (!this.groups) {
            this.groups = new Set();
        }
        this.groups.add(group_name);
    }

    private addFieldDefinitionToGroup(group: string, field: FieldDefinition) {
        if (!this.groupToFields) {
            this.groupToFields = new Map();
        }
        let definitions = this.groupToFields.get(group);
        if (definitions == null) {
            definitions = [];
        }
        definitions.push(field);
        this.groupToFields.set(group, definitions);
    }

}
