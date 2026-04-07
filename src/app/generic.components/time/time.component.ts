import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: "app-time",
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                <p-datepicker
                        [timeOnly]="true"
                        [formControlName]="field.name">
                </p-datepicker>
            </div>
        </div>
    `,
    styles: [],
    imports: [ReactiveFormsModule, DatePicker]
})
export class TimeComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    constructor() {
    }

    ngOnInit() {
    }
}
