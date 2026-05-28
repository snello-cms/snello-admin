import {Component, OnInit, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ReactiveFormsModule, UntypedFormGroup} from '@angular/forms';
import {MultiSelectModule} from 'primeng/multiselect';
import {FieldDefinition} from '../../models/field-definition';
import {ApiService} from '../../services/api.service';
import {FieldDefinitionService} from '../../services/field-definition.service';

@Component({
    selector: 'app-multiselect',
    standalone: true,
    template: `
      <div class="form-group clearfix row" [formGroup]="group">
        <label class="col-sm-3">{{ field.name }}{{ field.mandatory ? ' (*)' : '' }}</label>
        <div class="col-sm-9">
          <p-multiselect
            [options]="options"
            [optionLabel]="labelField"
            [optionValue]="field.join_table_key"
            [formControlName]="field.name"
            [placeholder]="field.label || field.name"
            [showClear]="true"
            [filter]="true"
            styleClass="w-100">
          </p-multiselect>
        </div>
      </div>
    `,
    styles: [],
    imports: [ReactiveFormsModule, MultiSelectModule]
})
export class MultiSelectComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    options: any[] = [];
    labelField = '';

    private destroyRef = inject(DestroyRef);

    constructor(
        private apiService: ApiService,
        private fieldDefinitionService: FieldDefinitionService
    ) {
    }

    ngOnInit() {
        this.labelField = this.fieldDefinitionService.fetchFirstLabel(this.field);
        this.bindControlChanges();
        this.applyExternalValue(this.getControlRawValue());

        this.apiService.getJoinList(this.field)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(options => {
                this.options = options ?? [];
            });
    }

    private bindControlChanges() {
        const fieldName = this.field.name;
        if (!fieldName) {
            return;
        }

        const control = this.group.get(fieldName);
        if (!control) {
            return;
        }

        control.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => this.applyExternalValue(value));
    }

    private getControlRawValue(): unknown {
        const fieldName = this.field.name;
        return fieldName ? this.group.get(fieldName)?.value : this.field.value;
    }

    private applyExternalValue(rawValue: unknown) {
        const normalized = this.normalizeIds(rawValue);
        const fieldName = this.field.name;
        const control = fieldName ? this.group.get(fieldName) : null;

        if (control && !this.areArraysEqual(control.value, normalized)) {
            control.setValue(normalized, {emitEvent: false});
        }

        this.field.value = normalized;
    }

    private normalizeIds(rawValue: unknown): string[] {
        if (rawValue == null || rawValue === '') {
            return [];
        }

        if (Array.isArray(rawValue)) {
            return Array.from(new Set(rawValue
                .map(value => this.extractJoinKey(value))
                .filter((value): value is string => value != null && value !== '')));
        }

        if (typeof rawValue === 'string') {
            return Array.from(new Set(rawValue
                .split(',')
                .map(value => value.trim())
                .filter(Boolean)));
        }

        const key = this.extractJoinKey(rawValue);
        return key ? [key] : [];
    }

    private extractJoinKey(value: unknown): string | null {
        if (value == null || value === '') {
            return null;
        }
        if (typeof value !== 'object') {
            return String(value);
        }

        const candidate = value as Record<string, unknown>;
        const keyName = this.field.join_table_key;
        if (keyName && candidate[keyName] != null && candidate[keyName] !== '') {
            return String(candidate[keyName]);
        }
        if (candidate.uuid != null && candidate.uuid !== '') {
            return String(candidate.uuid);
        }
        if (candidate.id != null && candidate.id !== '') {
            return String(candidate.id);
        }
        return null;
    }

    private areArraysEqual(left: unknown, right: string[]): boolean {
        const leftArray = Array.isArray(left) ? left.map(value => String(value)) : [];
        if (leftArray.length !== right.length) {
            return false;
        }
        return leftArray.every((value, index) => value === right[index]);
    }
}
