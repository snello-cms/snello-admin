import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {SelectItem} from 'primeng/api';

@Component({
    selector: 'app-html-output',
    standalone: true,
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9" [innerHTML]="field.value">
            </div>
        </div>
    `,
    styles: [],
    imports: [ReactiveFormsModule]
})
export class HtmlViewComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    options: SelectItem[] = [];

    constructor() {
    }

    ngOnInit() {
    }

}
