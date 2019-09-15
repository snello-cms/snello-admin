import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';

@Component({
    selector: 'app-tinymce',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                <editor id="testo" [formControlName]="field.name"
                        [init]="{entity_encoding: 'numeric', plugins: 'table hr link image',  menubar: 'false', height: 300, toolbar: 'image | table | hr | link | removeformat | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'}"></editor>
                <ng-container *ngFor="let validation of field.validations">
                </ng-container>
            </div>
        </div>
    `,
    styles: []
})
export class TinymceComponent implements OnInit {
    field: FieldDefinition;
    group: FormGroup;

    constructor() {
    }

    ngOnInit() {
    }
}
