import {Component, OnInit, DestroyRef, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {SelectItem} from 'primeng/api';
import {ApiService} from '../../services/api.service';
import {Observable, of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {catchError, tap} from 'rxjs/operators';
import {FieldDefinitionService} from "../../services/field-definition.service";
import { AutoComplete } from 'primeng/autocomplete';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-multijoin',
    standalone: true,
    template: `
        @if (joinList$ | async) {
                    <div class="form-group clearfix" [formGroup]="group">
                        <div class="row">
              <label class="col-sm-3">
                {{ field.name }}{{ field.mandatory ? ' (*)' : '' }}
              </label>
              <div class="col-sm-9">
                <p-autoComplete
                  [suggestions]="options" (completeMethod)="search($event)" [size]="30"
                                                                        [optionLabel]="labelField" [dataKey]="field.join_table_key" [dropdown]="true"
                                    appendTo="body"
                                    [autoZIndex]="true"
                                    [baseZIndex]="3000"
                  [formControlName]="field.name" [forceSelection]="true" [multiple]="true">
                </p-autoComplete>
              </div>
            </div>
          </div>
        }
        `,
    styles: [],
    imports: [ReactiveFormsModule, AutoComplete, AsyncPipe]
})
export class MultiJoinComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    options: SelectItem[] = [];
    labelField = '';
    labelMap: Map<string, any> = new Map();
    values: string[] = [];
    filteredValue: string;

    joinList$: Observable<any[]>;

    uuid: string;
    name: string;


    private destroyRef = inject(DestroyRef);

    constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private fieldDefinitionService: FieldDefinitionService) {
    }

    ngOnInit() {

        this.labelField = this.fieldDefinitionService.fetchFirstLabel(this.field);
        this.uuid = this.activatedRoute.snapshot.params['uuid'];
        this.name = this.activatedRoute.snapshot.params['name'];
        const fieldName = this.field.name;
        const initialIds = this.normalizeMultijoinIds(this.field.value);


        this.apiService.getJoinList(this.field)
            .pipe(
                catchError(() => of([])),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(options => {
                    this.options = options;
                }
            );

        if (initialIds.length > 0 && fieldName) {
            console.debug('[multijoin] loading from saved ids', {
                field: fieldName,
                ids: initialIds
            });
            this.joinList$ = this.loadObjectsByIds(initialIds)
                .pipe(
                    catchError(() => of([])),
                    tap(join => {
                        this.options = join;
                        this.group.get(fieldName)?.setValue(join);
                        console.debug('[multijoin] loaded linked objects', {
                            field: fieldName,
                            count: join.length,
                            labels: join.map(item => item?.[this.labelField]).filter(Boolean)
                        });
                    })
                );
        } else {
            this.joinList$ = of([]);
        }

    }

    private normalizeMultijoinIds(rawValue: unknown): string[] {
        if (rawValue == null || rawValue === '') {
            return [];
        }

        if (Array.isArray(rawValue)) {
            return rawValue
                .map(value => this.extractJoinKey(value))
                .filter((value): value is string => value != null && value !== '');
        }

        if (typeof rawValue === 'string') {
            return rawValue
                .split(',')
                .map(value => value.trim())
                .filter(Boolean);
        }

        const keyValue = this.extractJoinKey(rawValue);
        return keyValue ? [keyValue] : [];
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

    private loadObjectsByIds(ids: string[]): Observable<any[]> {
        if (ids.length === 0) {
            return of([]);
        }

        const selectFields = `${this.field.join_table_select_fields},${this.field.join_table_key}`;
        return this.apiService.fetchObjectsByKeys(
            this.field.join_table_name,
            this.field.join_table_key,
            ids,
            selectFields
        );
    }


    search(event: { query?: string }) {
        this.apiService.getJoinList(this.field, event.query, this.labelField)
            .pipe(
                catchError(() => of([])),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(options => {
                    this.options = options;
                }
            );
    }

    handleDropdown(event: unknown) {
        void event;
        // event.query = current value in input field
    }

    selectRecord(event: any) {

    }

    removeRecord(event: string) {

    }
}
