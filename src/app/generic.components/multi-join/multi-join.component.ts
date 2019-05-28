import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {SelectItem} from "primeng/api";
import {ApiService} from "../../service/api.service";

@Component({
  selector: "app-multijoin",
  template: `
  <div class="form-group clearfix row" [formGroup]="group">
  <div class="col-sm-12">
      <label class="col-sm-3">
        {{ field.name }}
      </label>
      <div class="col-sm-9">
      <div class="col-sm-9">

      <p-autoComplete
        [suggestions]="options" (completeMethod)="search($event)" [dropdown]="true" 
        [(ngModel)]="filteredValue" [ngModelOptions]="{standalone: true}"
        (onSelect)="selectRecord($event)" [forceSelection]="true">

        <ng-template let-brand pTemplate="item">
          <div class="ui-helper-clearfix">
            <div style="font-size:18px;float:right;margin:10px 10px 0 0">{{labelMap.get(brand)}}</div>
          </div>
        </ng-template>
        
      </p-autoComplete>

    </div>

      
      </div>
  </div>
  <div class="col-sm-12">
    <ul>
        <li *ngFor="let c of values">{{ decodeName(c) }}<i
        class="pi pi-times" (click)="removeRecord(c)"></i></li>
    </ul>
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
    let splittedFields = this.field.join_table_select_fields.split(",");
    this.labelField  = splittedFields[0];
    if (this.labelField == this.field.join_table_key && splittedFields.length > 1) {
      this.labelField  = splittedFields[1];
    }
    if (this.field.value) {
      this.values = this.field.value; 
    }
    this.apiService.getJoinList(this.field)
      .subscribe(options => {
          let currValues = [];
          if (options != null && options.length > 0) {
              for (let value of options) {
                  currValues.push({label: value[this.labelField], value: value[this.field.join_table_key]});
                  this.labelMap.set(value[this.field.join_table_key], value[this.labelField]);
              }
          }
          this.options = currValues;
        }
      );
  }

  decodeName(fullValue: string) {
    if (!fullValue) {
      return null;
    }
    let valueAndName = fullValue.split(":");
    return valueAndName[1];
  }

  search(event) {
    this.apiService.getJoinList(this.field, event.query, this.labelField)
      .subscribe(options => {
          let currValues = [];
          if (options != null && options.length > 0) {
            for (let value of options) {
              currValues.push(value[this.field.join_table_key]);
              this.labelMap.set(value[this.field.join_table_key], value[this.labelField]);
            }
          }
          this.options = currValues;
        }
      );
  }

  handleDropdown(event) {
    //event.query = current value in input field
  }

  selectRecord(event: any) {
    this.filteredValue = null;

    for (let il = 0; il < this.values.length; il++) {
      if (this.values[il].startsWith(event)) {
        return;
      }
    }
    let mix = event + ':' + this.labelMap.get(event);
    this.values.push(mix);
    this.group.get(this.field.name).setValue(this.values);
  }

  
  removeRecord(event: string) {
    for (let il = 0; il < this.values.length; il++) {
      if (this.values[il].startsWith(event)) {
        this.values.splice(il, 1);
      }
    }
    this.group.get(this.field.name).setValue(this.values);
  }
}
