import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import { DynamicFieldDirective } from '../dynamic-field/dynamic-field.directive';

@Component({
    selector: 'dynamic-search-form',
    template: `
    <form class="dynamic-form" [formGroup]="searchForm" (submit)="onSubmit($event)">
      @for (field of fields; track field) {
        <ng-container dynamicField [field]="field" [group]="searchForm">
        </ng-container>
      }
    </form>
    `,
    styles: [],
    imports: [ReactiveFormsModule, DynamicFieldDirective]
})
export class DynamicSearchFormComponent implements OnInit {

  @Input() fields: FieldDefinition[] = [];
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  searchForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) {
  }

  get value() {
    return this.searchForm.value;
  }

  ngOnInit() {
    this.searchForm = this.createControl();
  }

  createControl() {
    const group = this.fb.group({});
    this.fields.forEach(field => {
      if (!field.name) {
        return;
      }
      const control = this.fb.control(
        field.value, this.bindValidations(field.validations || [])
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
    if (this.searchForm.valid) {
      this.submit.emit(this.searchForm.value);
    } else {
      this.validateAllFormFields(this.searchForm);
    }
  }

  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({onlySelf: true});
    });
  }
}
