import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
  selector: 'dynamic-search-form',
  template: `
    <form class="dynamic-form" [formGroup]="searchForm" (submit)="onSubmit($event)">
      <ng-container *ngFor="let field of fields;" dynamicField [field]="field" [group]="searchForm">
      </ng-container>
    </form>
  `,
  styles: []
})
export class DynamicSearchFormComponent implements OnInit {

  @Input() fields: FieldDefinition[] = [];
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
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
    if (this.searchForm.valid) {
      this.submit.emit(this.searchForm.value);
    } else {
      this.validateAllFormFields(this.searchForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control.markAsTouched({onlySelf: true});
    });
  }
}
