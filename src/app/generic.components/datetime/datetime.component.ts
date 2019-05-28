import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

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
    styles: []
})
export class DatetimeComponent implements OnInit {
    field: FieldDefinition;
    group: FormGroup;

    constructor() {
    }

    ngOnInit() {
    }
}
