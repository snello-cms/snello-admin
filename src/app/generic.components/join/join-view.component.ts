import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from '../../service/api.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { tap, take } from 'rxjs/operators';

@Component({
    selector: 'app-join',
    template: `
        <div *ngIf="join$ | async as join" class="form-group clearfix" [formGroup]="group">
            <div class="row">
                <label class="col-sm-3">
                    {{ join[labelField] }}
                </label>
            </div>
        </div>
    `,
    styles: []
})
export class JoinViewComponent implements OnInit {
    field: FieldDefinition;
    group: FormGroup;

    labelField: string;

    join$: Observable<any>;

    uuid: string;
    name: string;

    constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        const splittedFields = this.field.join_table_select_fields.split(',');
        this.labelField  = splittedFields[0];
        if (this.labelField === this.field.join_table_key && splittedFields.length > 1) {
          this.labelField  = splittedFields[1];
        }

        this.uuid = this.activatedRoute.snapshot.params['uuid'];
        this.name = this.activatedRoute.snapshot.params['name'];

        this.join$ =
            this.apiService.fetchJoinList(this.name, this.uuid, this.field.join_table_name)
            .pipe(
                tap(join => this.group.get(this.field.name).setValue(join)),
                take(1)
            );
    }

    handleDropdown(event) {
        // event.query = current value in input field
    }

}
