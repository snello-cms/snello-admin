import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../service/configuration.service';

@Component({
    selector: 'app-tinymce',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                <editor [formControlName]="field.name" 
                        [init]="{ base_url: asset_path+'tinymce',suffix: '.min', entity_encoding: 'numeric', plugins: 'table hr link image',  menubar: 'false', height: 300, toolbar: 'image | table | hr | link | removeformat | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'}"></editor>
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
    asset_path: string;

    constructor(configurationService: ConfigurationService) {
        configurationService.getValue(ASSET_PATH).subscribe(
            path => {
                console.log(path);
                this.asset_path = path;
            });
    }

    ngOnInit() {
    }
}
