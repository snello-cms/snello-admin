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

      <p-autoComplete
      [suggestions]="options" (completeMethod)="search($event)" [size]="30" 
      [field]="labelField" [dataKey]="field.join_table_key" [dropdown]="true"
      [formControlName]="field.name" [forceSelection]="true" [multiple]="true">


      </p-autoComplete>

      
      </div>
  </div>
</div>
  `,
  styles: []
})
export class MultiJoinComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  options: SelectItem[] = [];
  labelField: string = null;
  labelMap: Map<string, any> = new Map();
  values: string[] = [];
  filteredValue: string;
  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    const splittedFields = this.field.join_table_select_fields.split(',');
    this.labelField  = splittedFields[0];
    if (this.labelField === this.field.join_table_key && splittedFields.length > 1) {
      this.labelField  = splittedFields[1];
    }
    this.apiService.getJoinList(this.field)
      .subscribe(options => {
          this.options = options;
        }
      );

    const observables = [];
    if (this.field.value && this.field.value.length > 0) {

      for (const uuid of this.field.value.split(",")) {

        observables.push(this.apiService.fetch(this.field.join_table_name, uuid));
      }

      forkJoin(
        observables
      ).subscribe( 
        resolved =>  {
          this.group.get(this.field.name).setValue(resolved);
        }
      );
    }
  }


  search(event) {
    this.apiService.getJoinList(this.field, event.query, this.labelField)
      .subscribe(options => {
          this.options = options;
        }
      );
  }

  handleDropdown(event) {
    //event.query = current value in input field
  }

  selectRecord(event: any) {
    
  }

  
  removeRecord(event: string) {
    
  }
}
