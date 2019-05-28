import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from "../../service/api.service";

@Component({
  selector: "app-join",
  template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <div class="col-sm-12">
          <label class="col-sm-3">
            {{ field.name }}
          </label>
          <div class="col-sm-9">
            {{ decodeName(field.value) }}<i
            class="pi pi-times" (click)="removeRecord()"></i>
          </div>
      </div>
      <div class="col-sm-12">
      <label class="col-sm-3">

      </label>
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
  `,
  styles: []
})
export class JoinComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  options: any[] = [];
  labelField: string;
  labelMap: Map<string, any> = new Map();

  filteredValue: any = null;
  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    let splittedFields = this.field.join_table_select_fields.split(",");
    this.labelField = splittedFields[0];
    if (this.labelField == this.field.join_table_key && splittedFields.length > 1) {
      this.labelField = splittedFields[1];
    }

    this.apiService.getJoinList(this.field)
      .subscribe(options => {
          if (options != null && options.length > 0) {
            for (let value of options) {
              this.options.push(value[this.field.join_table_key])
              this.labelMap.set(value[this.field.join_table_key], value[this.labelField]);
            }
          }
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

  handleDropdown(event) {
    //event.query = current value in input field
  }

  selectRecord(event: any) {
    this.field.value = event + ':' + this.labelMap.get(event);
    this.group.get(this.field.name).setValue(this.field.value);
    this.filteredValue = "";
  }
  
  removeRecord() {
    this.filteredValue = null;
    this.group.get(this.field.name).setValue(null);
    this.field.value = null;
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

}
