import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from '../../service/api.service';
import { of, forkJoin, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import {FieldDefinitionService} from "../../service/field-definition.service";

@Component({
  selector: 'app-multijoin',
  template: `
  <div *ngIf="joinList$ | async as values" class="form-group clearfix row" [formGroup]="group">
  <div class="col-sm-12">
      <label class="col-sm-3">
        {{ field.name }}
      </label>
      <div class="col-sm-9">

      <ul>
        <li *ngFor="let c of values">
          {{ c[labelField] }}
          <i class="pi pi-times"></i>
        </li>
      </ul>

      </div>
  </div>
  <div class="col-sm-12">

  </div>
</div>
  `,
  styles: []
})
export class MultiJoinViewComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  labelField: string = null;
  joinList$: Observable<any[]>;


  uuid: string;
  name: string;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private fieldDefinationService: FieldDefinitionService) {
  }


  ngOnInit() {
    this.labelField = this.fieldDefinationService.fetchFirstLabel(this.field);
    this.uuid = this.activatedRoute.snapshot.params['uuid'];
    this.name = this.activatedRoute.snapshot.params['name'];


    const observables = [];
      this.joinList$ =
          this.apiService.fetchJoinList(this.name, this.uuid, this.field.join_table_name, this.field.join_table_select_fields)
          .pipe(
              tap(join => this.group.get(this.field.name).setValue(join)),
          );

  }

}
