import {Component, OnInit, inject, input, output} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { DynamicFieldDirective } from '../dynamic-field/dynamic-field.directive';
import { TabsModule } from 'primeng/tabs';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    selector: 'dynamic-form',
    standalone: true,
    template: `
        <form class="dynamic-form" [formGroup]="form" (submit)="onSubmit($event)">
        
          @if (!groupToFields) {
            <div>
              @for (field of fields(); track field) {
                <ng-container dynamicField [field]="field" [group]="form" [view]="view()">
                </ng-container>
              }
            </div>
          }
        
          @if (tabs && tabsArray.length > 0) {
            <p-tabs [value]="tabsArray[0]">
              <p-tablist>
                @for (tab of tabsArray; track tab) {
                  <p-tab [value]="tab">{{ tab }}</p-tab>
                }
              </p-tablist>
              <p-tabpanels>
                @for (tab of tabsArray; track tab) {
                  <p-tabpanel [value]="tab">
                    @if (groupToFields.get(tab)) {
                      <div>
                        @for (field of groupToFields.get(tab); track field) {
                          <ng-container dynamicField [field]="field"
                            [group]="form" [view]="view()">
                          </ng-container>
                        }
                      </div>
                    }
                    @if (!groupToFields.get(tab)) {
                      <div>
                        @for (group of tabToGroups.get(tab); track group) {
                          <p-fieldset [legend]="group">
                            @for (field of groupToFields.get(group); track field) {
                              <ng-container dynamicField [field]="field"
                                [group]="form" [view]="view()">
                              </ng-container>
                            }
                          </p-fieldset>
                        }
                      </div>
                    }
                  </p-tabpanel>
                }
              </p-tabpanels>
            </p-tabs>
          }
        
          @if (groups) {
            <div>
              @for (group of groups; track group) {
                <p-fieldset [legend]="group">
                  @for (field of groupToFields.get(group); track field) {
                    <ng-container dynamicField [field]="field"
                      [group]="form" [view]="view()">
                    </ng-container>
                  }
                </p-fieldset>
              }
            </div>
          }
        
        </form>
        `,
    styles: [],
    imports: [ReactiveFormsModule, DynamicFieldDirective, TabsModule, FieldsetModule]
})
export class DynamicFormComponent implements OnInit {

    private fb = inject(UntypedFormBuilder);

    get value() {
        return this.form.value;
    }

    fields = input<FieldDefinition[]>([]);
    view = input(false);
    submit = output<any>();
    form: UntypedFormGroup;

    tabs: Set<string> | null = null;
    tabsArray: string[] = [];
    groups: Set<string> | null = null;
    tabToGroups: Map<string, Set<string>> = new Map();
    groupToFields: Map<string, FieldDefinition[]> | null = null;

    ngOnInit() {

        this.tabs = null;
        this.groups = null;

        for (const field of this.fields()) {

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

        this.tabsArray = this.tabs ? Array.from(this.tabs) : [];
        this.form = this.createControl();
    }


    createControl() {
        const group = this.fb.group({});
        this.fields().forEach(field => {
        if (!field.name) {
          return;
        }
            const validList: ValidatorFn[] = [];
            if (field.mandatory) {
                validList.push(Validators.required);
            }
            (field.validations || []).forEach(valid => validList.push(valid.validator));
            const control = this.fb.control(
                field.value, validList.length > 0 ? Validators.compose(validList) : null
            );
            group.addControl(field.name, control);
        });
        return group;
    }

    bindValidations(validations: Array<{ validator: ValidatorFn }>) {
        if (validations.length > 0) {
        const validList: ValidatorFn[] = [];
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

    validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
        control?.markAsTouched({onlySelf: true});
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
