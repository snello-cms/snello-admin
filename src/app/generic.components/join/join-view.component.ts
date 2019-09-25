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
          {{outValue}}
        </div>
     
      </div>
    </div>



    `,
  styles: []
})
export class JoinViewComponent implements OnInit {
  field: FieldDefinition;
  group: FormGroup;

  labelField: string;

  outValue: string;
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
          this.outValue = value[this.labelField];
        }
      );
    }

  }


  handleDropdown(event) {
    //event.query = current value in input field
  }

}
