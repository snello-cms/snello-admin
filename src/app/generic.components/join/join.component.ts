import {Component, OnInit, DestroyRef, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {ApiService} from '../../services/api.service';
import {ActivatedRoute} from '@angular/router';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import { AutoComplete } from 'primeng/autocomplete';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-join',
    standalone: true,
    template: `
        @if (join$ | async; as value) {
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
                                    [formControlName]="field.name" [forceSelection]="true">
                </p-autoComplete>
              </div>
            </div>
          </div>
        }
        `,
    styles: [],
    imports: [ReactiveFormsModule, AutoComplete, AsyncPipe]
})
export class JoinComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    join$: Observable<any>;
    options: any[] = [];
    labelField: string;
    labelMap: Map<string, any> = new Map();

    uuid: string;
    name: string;

    filteredValue: any = null;

    private destroyRef = inject(DestroyRef);

    constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {

        const splittedFields = this.field.join_table_select_fields.split(',');
        this.labelField = splittedFields[0];
        if (this.labelField === this.field.join_table_key && splittedFields.length > 1) {
            this.labelField = splittedFields[1];
        }

        this.uuid = this.activatedRoute.snapshot.params['uuid'];
        this.name = this.activatedRoute.snapshot.params['name'];
        const fieldName = this.field.name;
        const rawJoinValue = this.field.value;
        const joinKeyValue = typeof rawJoinValue === 'object' && rawJoinValue != null
            ? rawJoinValue[this.field.join_table_key]
            : rawJoinValue;
        const hasJoinValue = joinKeyValue != null && joinKeyValue !== '';

        if (this.uuid && fieldName && hasJoinValue) {
            this.join$ =
                this.apiService.fetchObject(
                    this.field.join_table_name,
                    joinKeyValue,
                    this.field.join_table_select_fields + ',' + this.field.join_table_key
                )
                    .pipe(
                        tap(join => {
                            this.options = join ? [join] : [];
                            this.group.get(fieldName)?.setValue(join ?? null);
                        }),
                    );

        } else {
            this.join$ = of({});
        }

    }


    handleDropdown(event: unknown) {
        void event;
        // event.query = current value in input field
    }


    search(event: { query?: string }) {
        this.apiService.getJoinList(this.field, event.query, this.labelField)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(options => {
                    this.options = options ?? [];
                }
            );
    }

}
