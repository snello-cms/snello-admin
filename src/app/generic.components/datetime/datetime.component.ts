import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: "app-datetime",
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                <p-datepicker
                        dateFormat="dd/mm/yy"
                        [formControlName]="field.name"
                        showTime="true" hourFormat="24">
                </p-datepicker>
            </div>
        </div>
    `,
    styles: [],
    imports: [ReactiveFormsModule, DatePicker]
})
export class DatetimeComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    constructor() {
    }

    ngOnInit() {
    }
}
