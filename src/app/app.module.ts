import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MaterialModule} from './material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {routing} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {InputComponent} from './generic.components/input/input.component';
import {ButtonComponent} from './generic.components/button/button.component';
import {SelectComponent} from './generic.components/select/select.component';
import {DateComponent} from './generic.components/date/date.component';
import {RadiobuttonComponent} from './generic.components/radiobutton/radiobutton.component';
import {CheckboxComponent} from './generic.components/checkbox/checkbox.component';
import {DynamicFieldDirective} from './generic.components/dynamic-field/dynamic-field.directive';
import {DynamicFormComponent} from './generic.components/dynamic-form/dynamic-form.component';
import {MetadataService} from './service/metadata.service';
import {ApiService} from './service/api.service';
import {HttpClientModule} from '@angular/common/http';
import {ConditionService} from './service/condition.service';
import {FieldDefinitionService} from './service/field-definition.service';
import {MetadataEditComponent} from "./components/metadata/metadata-edit.component";
import {MetadataListComponent} from "./components/metadata/metadata-list.component";
import {ExampleComponent} from "./components/example/example.component";
import {OutletComponent} from "./common/outlet.component";
import {FieldDefinitionEditComponent} from "./components/field-definition/field-definition-edit.component";
import {FieldDefinitionListComponent} from "./components/field-definition/field-definition-list.component";
import {MatTableModule} from '@angular/material/table';
import {MatCardModule, MatPaginatorModule, MatSidenavModule} from "@angular/material";
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ConditionListComponent} from "./components/condition/condition-list.component";
import {HomepageComponent} from "./components/homepage/homepage.component";
import {AppTopBar} from "./components/topbar/topbar.component";
import {ConditionEditComponent} from "./components/condition/condition-edit.component";
import {DataListService} from "./service/data-list.service";
import {FormGenerationMetadataListComponent} from "./components/form-generation/form-generation-metadata-list.component";
import {FormGenerationListComponent} from "./components/form-generation/form-generation-list.component";
import {FormGenerationEditComponent} from "./components/form-generation/form-generation-edit.component";
import {TextAreaComponent} from "./generic.components/textarea/textarea.component";
import {DocumentService} from "./service/document.service";
import {DocumentListComponent} from "./components/documents/document-list.component";
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';


@NgModule({
  declarations: [
    AppComponent,
    AppTopBar,
    HomepageComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    TextAreaComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFieldDirective,
    DynamicFormComponent,
    MetadataEditComponent,
    MetadataListComponent,
    FieldDefinitionEditComponent,
    FieldDefinitionListComponent,
    ConditionListComponent,
    ConditionEditComponent,
    DocumentListComponent,
    ExampleComponent,
    FormGenerationMetadataListComponent,
    FormGenerationListComponent,
    FormGenerationEditComponent,
    OutletComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    HttpClientModule,
    routing,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSidenavModule,

    TableModule,
    DropdownModule
  ],
  entryComponents: [
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    TextAreaComponent,
    CheckboxComponent,
  ],
  providers: [
    MetadataService,
    ApiService,
    ConditionService,
    DocumentService,
    FieldDefinitionService,
    DataListService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
