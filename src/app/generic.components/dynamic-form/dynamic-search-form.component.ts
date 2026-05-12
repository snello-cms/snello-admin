import {Component, OnInit, inject, input, output} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { DynamicFieldDirective } from '../dynamic-field/dynamic-field.directive';

@Component({
    selector: 'dynamic-search-form',
    standalone: true,
    template: `
    <form class="dynamic-form" [formGroup]="searchForm" (submit)="onSubmit($event)">
      @for (field of fields(); track field.name ?? field.search_field_name ?? $index) {
        <ng-container dynamicField [field]="field" [group]="searchForm">
        </ng-container>
      }
    </form>
    `,
    styles: [],
    imports: [ReactiveFormsModule, DynamicFieldDirective]
})
export class DynamicSearchFormComponent implements OnInit {

  fields = input<FieldDefinition[]>([]);
  submit = output<any>();
  searchForm: UntypedFormGroup;

  private fb = inject(UntypedFormBuilder);

  get value() {
    return this.searchForm.value;
  }

  ngOnInit() {
    this.searchForm = this.createControl();
  }

  createControl() {
    const group = this.fb.group({});
    this.fields().forEach(field => {
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
