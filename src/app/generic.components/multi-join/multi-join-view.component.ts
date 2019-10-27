import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {SelectItem} from "primeng/api";
import {ApiService} from "../../service/api.service";
import { of, forkJoin } from 'rxjs';

@Component({
  selector: "app-multijoin",
  template: `
  <div class="form-group clearfix row" [formGroup]="group">
  <div class="col-sm-12">
      <label class="col-sm-3">
        {{ field.name }}
      </label>
      <div class="col-sm-9">

      <ul>
        <li *ngFor="let c of values">{{ decodeName(c) }}
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
  values: any[] = [];
  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    let splittedFields = this.field.join_table_select_fields.split(",");
    this.labelField  = splittedFields[0];
    if (this.labelField == this.field.join_table_key && splittedFields.length > 1) {
      this.labelField  = splittedFields[1];
    }
    
    let observables = [];
    if (this.field.value && this.field.value.length > 0) {

      for(let uuid of this.field.value.split(",")) { 
        observables.push(this.apiService.fetchObject(this.field.join_table_name, uuid));
      }
      
      forkJoin(
        observables
      ).subscribe( 
        resolved =>  {
          this.values = resolved;
        }
      );
    }
  }
  
  decodeName(object: any) {
    return object[this.labelField];
  }
}
