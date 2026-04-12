import {Component, DestroyRef, OnInit, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../services/configuration.service';
import { EditorComponent } from 'ngx-monaco-editor-v2';

@Component({
    selector: 'app-monaco',
    standalone: true,
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
          <div class="col-sm-9">
            <ngx-monaco-editor
              class="form-control template-editor"
              [options]="editorOptions"
              type="text"
              name="header"
                            [formControlName]="field.name"></ngx-monaco-editor>
            @for (validation of field.validations; track validation) {
            }
          </div>
        </div>
        `,
    styles: [],
    imports: [ReactiveFormsModule, EditorComponent]
})
export class MonacoComponent implements OnInit {
    field!: FieldDefinition;
    group!: UntypedFormGroup;
    asset_path?: string;
    editorOptions = {
        language: 'html',
        minimap: {
            enabled: false
        },
        automaticLayout: true
    };
    private readonly configurationService = inject(ConfigurationService);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.configurationService.getValue(ASSET_PATH).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            path => {
                this.asset_path = path;
            });
    }

    ngOnInit() {
    }
}
