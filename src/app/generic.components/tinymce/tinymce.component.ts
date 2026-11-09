import {Component, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {ASSET_PATH, TINYMCE_LICENSE_KEY} from '../../constants/constants';
import {ConfigurationService} from '../../services/configuration.service';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
    selector: 'app-tinymce',
    standalone: true,
    template: `
        <div class="form-group clearfix row" [formGroup]="group">
          <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
          <div class="col-sm-9">
            @if (init) {
              <editor [formControlName]="field.name" [init]="init"></editor>
            }
            @for (validation of field.validations; track validation?.name ?? validation?.message ?? $index) {
            }
          </div>
        </div>
        `,
    styles: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, EditorComponent]
})
export class TinymceComponent {
    field: FieldDefinition | undefined;
    group: UntypedFormGroup | undefined;
    /** Built once from the runtime config, so the editor never starts without base_url / license_key. */
    init: Record<string, unknown> | undefined;
    private readonly configurationService = inject(ConfigurationService);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.configurationService.getConfiguration().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(config => {
            const assetPath = String(config[ASSET_PATH] ?? '');
            // TinyMCE 7+ disables the editor ("a TinyMCE license key has not been provided") without a key.
            // 'gpl' accepts the open source license; a commercial key also works. Set per deployment in config.json.
            const licenseKey = String(config[TINYMCE_LICENSE_KEY] ?? '');
            if (!licenseKey) {
                console.warn(`[tinymce] no "${TINYMCE_LICENSE_KEY}" in runtime config: the editor will be disabled`);
            }
            this.init = {
                base_url: assetPath + 'tinymce',
                suffix: '.min',
                license_key: licenseKey || undefined,
                entity_encoding: 'numeric',
                plugins: 'table link image',
                menubar: false,
                height: 300,
                toolbar: 'image | table | link | removeformat | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'
            };
        });
    }
}
