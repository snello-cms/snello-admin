import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {SelectItem} from 'primeng/api';
import {ApiService} from '../../service/api.service';
import {Observable, of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {tap} from 'rxjs/operators';
import {FieldDefinitionService} from "../../service/field-definition.service";
import { AutoComplete } from 'primeng/autocomplete';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-multijoin',
    template: `
        @if (joinList$ | async) {
          <div class="form-group clearfix row" [formGroup]="group">
            <div class="col-sm-12">
              <label class="col-sm-3">
                {{ field.name }}
              </label>
              <div class="col-sm-9">
                <p-autoComplete
                  [suggestions]="options" (completeMethod)="search($event)" [size]="30"
                                    [optionLabel]="labelField" [optionValue]="field.join_table_key" [dataKey]="field.join_table_key" [dropdown]="true"
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


    constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private fieldDefinitionService: FieldDefinitionService) {
    }

    ngOnInit() {

        this.labelField = this.fieldDefinitionService.fetchFirstLabel(this.field);
        this.uuid = this.activatedRoute.snapshot.params['uuid'];
        this.name = this.activatedRoute.snapshot.params['name'];
        const fieldName = this.field.name;


        this.apiService.getJoinList(this.field)
            .subscribe(options => {
                    this.options = options;
                }
            );

        const observables = [];

        if (this.uuid && fieldName) {
            this.joinList$ =
                this.apiService.fetchJoinList(
                    this.name,
                    this.uuid,
                    this.field.join_table_name,
                    this.field.join_table_select_fields + ',' + this.field.join_table_key
                )
                    .pipe(
                        tap(join => {
                            this.options = join;
                            this.group.get(fieldName)?.setValue(
                                Array.isArray(join)
                                    ? join.map(item => item?.[this.field.join_table_key]).filter(Boolean)
                                    : []
                            );
                        }),
                    );

        } else {
            this.joinList$ = of([]);
        }

    }


    search(event: { query?: string }) {
        this.apiService.getJoinList(this.field, event.query, this.labelField)
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
