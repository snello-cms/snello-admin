import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastModule} from 'primeng/toast';

import {
  AutoCompleteModule,
  BlockUIModule,
  CalendarModule,
  CheckboxModule,
  ChipsModule,
  ConfirmDialogModule,
  DropdownModule,
  FieldsetModule,
  FileUploadModule,
  InputSwitchModule,
  InputTextareaModule,
  MessageModule,
  MessagesModule,
  PanelModule,
  ProgressBarModule,
  RadioButtonModule,
  TabViewModule
} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {MultiSelectModule} from 'primeng/multiselect';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    InputTextareaModule,
    CheckboxModule,
    CalendarModule,
    TableModule,
    ChipsModule,
    InputSwitchModule,
    DropdownModule,
    MessagesModule,
    MessageModule,
    AutoCompleteModule,
    PanelModule,
    FileUploadModule,
    MultiSelectModule,
    ProgressBarModule,
    TabViewModule,
    FieldsetModule,
    BlockUIModule,
    ToastModule,
    RadioButtonModule
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    InputTextareaModule,
    CheckboxModule,
    CalendarModule,
    TableModule,
    ChipsModule,
    InputSwitchModule,
    DropdownModule,
    AutoCompleteModule,
    MessagesModule,
    MessageModule,
    PanelModule,
    FileUploadModule,
    MultiSelectModule,
    ProgressBarModule,
    TabViewModule,
    FieldsetModule,
    BlockUIModule,
    RadioButtonModule,
    ToastModule,
  ],
  entryComponents: []
})
export class SharedModule {

}
