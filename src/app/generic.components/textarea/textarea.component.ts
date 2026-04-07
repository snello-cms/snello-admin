import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
    selector: 'app-textarea',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}</label>
          <div class="col-sm-9">
            <textarea pInputTextarea
              [formControlName]="field.name"
            [placeholder]="field.label"></textarea>
            @for (validation of field.validations; track validation) {
            }
          </div>
        </div>
        `,
    styles: [],
    imports: [ReactiveFormsModule, InputTextarea]
})
export class TextAreaComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    constructor() {
    }

    ngOnInit() {
    }
}
