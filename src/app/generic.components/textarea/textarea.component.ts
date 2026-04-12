import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { Textarea } from 'primeng/textarea';

@Component({
    selector: 'app-textarea',
    standalone: true,
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}</label>
          <div class="col-sm-9">
            <textarea pTextarea
              [formControlName]="field.name"
            [placeholder]="field.label"></textarea>
            @for (validation of field.validations; track validation) {
            }
          </div>
        </div>
        `,
    styles: [],
    imports: [ReactiveFormsModule, Textarea]
})
export class TextAreaComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    constructor() {
    }

    ngOnInit() {
    }
}
