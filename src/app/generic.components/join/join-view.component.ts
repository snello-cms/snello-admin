import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {ApiService} from '../../services/api.service';
import {Observable, of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {tap} from 'rxjs/operators';
import {FieldDefinitionService} from '../../services/field-definition.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-join',
    standalone: true,
    template: `
        @if (join$ | async; as join) {
          <div class="form-group clearfix row" [formGroup]="group">
            <label class="col-sm-3">{{ field.name }}</label>
            <div class="col-sm-9">
              {{ join[labelField] }}
            </div>
          </div>
        }
        `,
    styles: [],
    imports: [ReactiveFormsModule, AsyncPipe]
})
export class JoinViewComponent implements OnInit {
    field: FieldDefinition;
    group: UntypedFormGroup;

    labelField: string;

    join$: Observable<any>;

    uuid: string;
    name: string;

    constructor(private apiService: ApiService,
                private activatedRoute: ActivatedRoute,
                private fieldDefinitionService: FieldDefinitionService) {
    }

    ngOnInit() {
        this.labelField = this.fieldDefinitionService.fetchFirstLabel(this.field);
        // key of the record
        this.uuid = this.activatedRoute.snapshot.params['uuid'];
        // Metadata name
        this.name = this.activatedRoute.snapshot.params['name'];

        const fieldName = this.field.name;
        const rawJoinValue = this.field.value;
        const joinKeyValue = typeof rawJoinValue === 'object' && rawJoinValue != null
            ? rawJoinValue[this.field.join_table_key]
            : rawJoinValue;
        const hasJoinValue = joinKeyValue != null && joinKeyValue !== '';

        if (!hasJoinValue) {
            this.join$ = of({});
            if (fieldName) {
                this.group.get(fieldName)?.setValue(null);
            }
            return;
        }

        this.join$ =
            this.apiService.fetchObject(this.field.join_table_name, joinKeyValue, this.field.join_table_select_fields)
                .pipe(
                    tap(join => {
                        if (!fieldName) {
                            return;
                        }
                        this.group.get(fieldName)?.setValue(join);
                    }),
                );
    }

    handleDropdown(event: unknown) {
        void event;
        // event.query = current value in input field
    }

}
