import {Component, OnInit, inject} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import { InputText } from 'primeng/inputtext';
import {MassivePreviewService} from '../../pages/form-generation/massive-preview.service';

@Component({
    selector: "app-input",
    standalone: true,
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{(field.label || field.name)}}{{field.mandatory ? '(*)' : ''}}</label>
      <div class="col-sm-9">
        <div style="display:flex; align-items:center; gap:.5rem;">
          <input
            pInputText
            [formControlName]="field.name"
            [placeholder]="field.label"
            [type]="field.input_type"
            style="flex:1 1 auto;"
            />
          @if (isMassiveCronField()) {
            <button type="button" class="btn btn-primary" [disabled]="!canPreviewMassive()" (click)="requestMassivePreview()">
              Preview
            </button>
          }
        </div>
        @for (validation of field.validations; track validation) {
        }
      </div>
    </div>
    `,
    styles: [],
    imports: [ReactiveFormsModule, InputText]
})
export class InputComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  private massivePreviewService = inject(MassivePreviewService, {optional: true});
  private static readonly MASSIVE_DATE_MIN = '__massive_date_min';
  private static readonly MASSIVE_DATE_MAX = '__massive_date_max';
  private static readonly MASSIVE_CRON = '__massive_cron_expression';

  constructor() {}

  ngOnInit() {}

  isMassiveCronField(): boolean {
    return this.field?.name === InputComponent.MASSIVE_CRON && !!this.massivePreviewService;
  }

  canPreviewMassive(): boolean {
    if (!this.isMassiveCronField() || !this.group) {
        return false;
    }

    const cronValue = this.group.get(InputComponent.MASSIVE_CRON)?.value;
    const minValue = this.group.get(InputComponent.MASSIVE_DATE_MIN)?.value;
    const maxValue = this.group.get(InputComponent.MASSIVE_DATE_MAX)?.value;

    return cronValue != null && String(cronValue).trim() !== ''
      && minValue != null && minValue !== ''
      && maxValue != null && maxValue !== '';
  }

  requestMassivePreview() {
    this.massivePreviewService?.requestPreview();
  }
}
