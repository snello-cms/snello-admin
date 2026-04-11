import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../model/field-definition';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
    selector: 'app-tag',
    template: `
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{field.name}}</label>
      <div class="col-sm-9">
        <p-autocomplete
          [formControlName]="field.name"
          [multiple]="true"
          [typeahead]="false"
          [addOnBlur]="true"
          [addOnTab]="true"
          separator="," 
          [suggestions]="tagSuggestions"
          placeholder="Aggiungi tag"
        ></p-autocomplete>
      </div>
    </div>
  `,
    styles: [],
    imports: [ReactiveFormsModule, AutoCompleteModule]
})
export class TagComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;
  tagSuggestions: string[] = [];

  constructor() {}

  ngOnInit() {}
}
