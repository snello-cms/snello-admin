import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: 'dynamic-view-form',
  template: `
  <form class="dynamic-view-form" [formGroup]="form" (submit)="onSubmit($event)">

  <div *ngIf="!groupToFields">
      <ng-container *ngFor="let field of fields;" dynamicField [field]="field" [group]="form" [view]="true">
      </ng-container>
  </div>

  <p-tabView *ngIf="tabs">
      <p-tabPanel [header]="tab" *ngFor="let tab of tabs; let i = index" [selected]="i == 0">
          <div *ngIf="groupToFields.get(tab)">
              <ng-container *ngFor="let field of groupToFields.get(tab);" dynamicField [field]="field"
                      [group]="form" [view]="true">
              </ng-container>
          </div>
          <div *ngIf="!groupToFields.get(tab)">
              <ng-container *ngFor="let group of tabToGroups.get(tab);">
                  <p-fieldset [legend]="group">
                      <ng-container *ngFor="let field of groupToFields.get(group);" dynamicField [field]="field"
                              [group]="form" [view]="true">
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
                      [group]="form" [view]="true">
              </ng-container>
          </p-fieldset>
      </ng-container>
  </div>

</form>
  `,
  styles: []
})
export class DynamicViewFormComponent implements OnInit {

  @Input() fields: FieldDefinition[] = [];
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  get value() {
    return this.form.value;
  }

  ngOnInit() {
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
}
