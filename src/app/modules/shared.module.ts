import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastModule} from 'primeng/toast';

import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {CheckboxModule} from 'primeng/checkbox';
import {CalendarModule} from 'primeng/calendar';
import {ChipsModule} from 'primeng/chips';
import {InputSwitchModule} from 'primeng/inputswitch';
import {DropdownModule} from 'primeng/dropdown';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {PanelModule} from 'primeng/panel';
import {FileUploadModule} from 'primeng/fileupload';
import {ProgressBarModule} from 'primeng/progressbar';
import {TabViewModule} from 'primeng/tabview';
import {FieldsetModule} from 'primeng/fieldset';
import {BlockUIModule} from 'primeng/blockui';
import {RadioButtonModule} from 'primeng/radiobutton';
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
