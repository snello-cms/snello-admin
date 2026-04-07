import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import { Calendar } from 'primeng/calendar';

@Component({
    selector: "app-datetime",
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                <p-calendar
                        dateFormat="dd/mm/yy"
                        [formControlName]="field.name"
                        showTime="true" hourFormat="24">
                </p-calendar>
            </div>
        </div>
    `,
    styles: [],
    imports: [ReactiveFormsModule, Calendar]
})
export class DatetimeComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    constructor() {
    }

    ngOnInit() {
    }
}
