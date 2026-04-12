import {Component, DestroyRef, OnInit, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {ASSET_PATH} from '../../constants/constants';
import {ConfigurationService} from '../../services/configuration.service';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
    selector: 'app-tinymce',
    standalone: true,
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
          <div class="col-sm-9">
            <editor [formControlName]="field.name"
                        [init]="{ base_url: asset_path+'tinymce', suffix: '.min', entity_encoding: 'numeric', plugins: 'table link image', menubar: false, height: 300, toolbar: 'image | table | link | removeformat | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'}"></editor>
            @for (validation of field.validations; track validation) {
            }
          </div>
        </div>
        `,
    styles: [],
    imports: [ReactiveFormsModule, EditorComponent]
})
export class TinymceComponent implements OnInit {
    field: FieldDefinition | undefined;
    group: UntypedFormGroup | undefined;
    asset_path: string | undefined;
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
