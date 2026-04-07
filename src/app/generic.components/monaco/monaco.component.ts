import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../service/configuration.service';
import { EditorComponent } from 'ngx-monaco-editor-v2';

@Component({
    selector: 'app-monaco',
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}</label>
          <div class="col-sm-9">
            <ngx-monaco-editor
              class="form-control template-editor"
              [options]="editorOptions"
              type="text"
              name="header"
            formControlName="field.name"></ngx-monaco-editor>
            @for (validation of field.validations; track validation) {
            }
          </div>
        </div>
        `,
    styles: [],
    imports: [ReactiveFormsModule, EditorComponent]
})
export class MonacoComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;
    asset_path: string;
    editorOptions = {
        language: 'html',
        minimap: {
            enabled: false
        },
        automaticLayout: true
    };

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
