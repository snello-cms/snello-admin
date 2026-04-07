import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from '../../service/api.service';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {tap, take} from 'rxjs/operators';
import {FieldDefinitionService} from '../../service/field-definition.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-join',
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
        this.join$ =
            this.apiService.fetchObject(this.field.join_table_name, this.field.value, this.field.join_table_select_fields)
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
