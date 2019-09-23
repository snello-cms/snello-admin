import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import {ApiService} from "../../service/api.service";

@Component({
  selector: "app-join",
  template: `
    <div class="form-group clearfix" [formGroup]="group">
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

    if (this.field.value) {
      this.apiService.fetch(this.field.join_table_name, this.field.value).subscribe(
        value => {
          this.group.get(this.field.name).setValue(value); 
        }
      );
    }

  }


  handleDropdown(event) {
    //event.query = current value in input field
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
