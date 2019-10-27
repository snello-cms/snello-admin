import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../service/configuration.service';

@Component({
    selector: 'app-ace9',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
                <div ace-editor
                        [formControlName]="field.name"
                        [mode]="'sql'"
                        [theme]="'eclipse'"
                        [readOnly]="false"
                        [autoUpdateContent]="true"
                        [durationBeforeCallback]="1000"
                        style="min-height: 200px; width:100%; overflow: auto;">
                </div>
                <ng-container *ngFor="let validation of field.validations">
                </ng-container>
            </div>
        </div>
    `,
    styles: []
})
export class AceComponent implements OnInit {
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
