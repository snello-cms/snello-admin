import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from '../../service/api.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, take } from 'rxjs/operators';

@Component({
    selector: 'app-join',
    template: `
        <div *ngIf="join | async" class="form-group clearfix" [formGroup]="group">
            <div class="row">
                <label class="col-sm-3">
                    {{ field.name }}
                </label>
                <div class="col-sm-9">
                    <p-autoComplete
                            [suggestions]="options" (completeMethod)="search($event)" [size]="30"
                            [field]="labelField" [dataKey]="field.join_table_key" [dropdown]="true"
                            [formControlName]="field.name" [forceSelection]="true">
                    </p-autoComplete>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class JoinComponent implements OnInit {
    field: FieldDefinition;
    group: FormGroup;

    join: Observable<any>;
    options: any[] = [];
    labelField: string;
    labelMap: Map<string, any> = new Map();

    uuid: string;
    name: string;

    filteredValue: any = null;

    constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.uuid = this.activatedRoute.snapshot.params['uuid'];
        this.name = this.activatedRoute.snapshot.params['name'];

        this.join =
            this.apiService.fetchJoinList(this.name, this.uuid, this.field.join_table_name)
            .pipe(
                tap(join => this.group.get(this.field.name).setValue(join)),
                take(1)
            );

    }


    handleDropdown(event) {
        // event.query = current value in input field
    }


    search(event) {
        this.apiService.getJoinList(this.field, event.query, this.labelField)
            .subscribe(options => {
                    if (options != null && options.length > 0) {
                        this.options = options;
                    }
                }
            );
    }

}
