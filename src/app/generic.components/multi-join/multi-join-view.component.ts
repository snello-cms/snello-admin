import {Component, OnInit} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {FieldDefinition} from '../../models/field-definition';
import {ApiService} from '../../services/api.service';
import { of, Observable } from 'rxjs';
import {FieldDefinitionService} from "../../services/field-definition.service";
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-multijoin',
    standalone: true,
    template: `
  @if (joinList$ | async; as values) {
    <div class="form-group clearfix row" [formGroup]="group">
      <label class="col-sm-3">{{ field.name }}</label>
      <div class="col-sm-9">
        @if (values.length === 0) {
          <span>-</span>
        } @else {
          <div class="multijoin-chip-list">
            @for (c of values; track c?.[field.join_table_key] ?? c?.[labelField] ?? $index) {
              <span class="multijoin-chip">{{ c[labelField] }}</span>
            }
          </div>
        }
      </div>
    </div>
  }
  `,
    styles: [`
      .multijoin-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .multijoin-chip {
        display: inline-flex;
        align-items: center;
        border: 1px solid #d8dbe2;
        background: #f5f7fb;
        border-radius: 999px;
        color: #2b2f38;
        font-size: 0.85rem;
        line-height: 1;
        padding: 0.35rem 0.6rem;
      }
    `],
    imports: [ReactiveFormsModule, AsyncPipe]
})
export class MultiJoinViewComponent implements OnInit {
  field: FieldDefinition;
  group: UntypedFormGroup;

  labelField: string = null;
  joinList$: Observable<any[]>;

  constructor(private apiService: ApiService, private fieldDefinationService: FieldDefinitionService) {
  }


  ngOnInit() {
    this.labelField = this.fieldDefinationService.fetchFirstLabel(this.field);
    const rawValue = this.field.value;
    const ids = Array.isArray(rawValue)
        ? rawValue
        : String(rawValue ?? '')
            .split(',')
            .map(value => value.trim())
            .filter(Boolean);

    if (ids.length === 0) {
      this.joinList$ = of([]);
      return;
    }

    const selectFields = `${this.field.join_table_select_fields},${this.field.join_table_key}`;
    this.joinList$ = this.apiService.fetchObjectsByKeys(
      this.field.join_table_name,
      this.field.join_table_key,
      ids,
      selectFields
    );

  }

}
