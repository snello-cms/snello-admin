import {RouterModule, Routes} from '@angular/router';
import {OutletComponent} from "./common/outlet.component";
import {MetadataListComponent} from "./components/metadata/metadata-list.component";
import {MetadataEditComponent} from "./components/metadata/metadata-edit.component";
import {ExampleComponent} from "./components/example/example.component";
import {FieldDefinitionListComponent} from "./components/field-definition/field-definition-list.component";
import {FieldDefinitionEditComponent} from "./components/field-definition/field-definition-edit.component";
import {ConditionListComponent} from "./components/condition/condition-list.component";
import {HomepageComponent} from "./components/homepage/homepage.component";
import {ConditionEditComponent} from "./components/condition/condition-edit.component";
import {FormGenerationMetadataListComponent} from "./components/form-generation/form-generation-metadata-list.component";
import {FormGenerationListComponent} from "./components/form-generation/form-generation-list.component";
import {FormGenerationEditComponent} from "./components/form-generation/form-generation-edit.component";
import {DocumentListComponent} from "./components/documents/document-list.component";

export const MainRoutes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},

  {
    path: 'home',
    component: HomepageComponent,
  },
  {
    path: 'metadata',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/metadata/list', pathMatch: 'full'},
      {path: 'list', component: MetadataListComponent},
      {path: 'edit/:id', component: MetadataEditComponent},
      {path: 'new', component: MetadataEditComponent},
    ]
  },
  {
    path: 'fielddefinition',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/fielddefinition/list', pathMatch: 'full'},
      {path: 'list', component: FieldDefinitionListComponent},
      {path: 'edit/:id', component: FieldDefinitionEditComponent},
      {path: 'new', component: FieldDefinitionEditComponent},
    ]
  },
  {
    path: 'condition',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/condition/list', pathMatch: 'full'},
      {path: 'list', component: ConditionListComponent},
      {path: 'edit/:id', component: ConditionEditComponent},
      {path: 'new', component: ConditionEditComponent},

    ]
  },
  {
    path: 'document',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/document/list', pathMatch: 'full'},
      {path: 'list', component: DocumentListComponent}
    ]
  },
  {
    path: 'datalist',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/datalist/metadata', pathMatch: 'full'},
      {path: 'metadata', component: FormGenerationMetadataListComponent},
      {path: 'list/:name', component: FormGenerationListComponent},
      {path: 'new/:name', component: FormGenerationEditComponent},
      {path: 'edit/:name/:uuid', component: FormGenerationEditComponent},
    ]
  },
  {
    path: 'example',
    component: ExampleComponent,
  },
];
export const routing = RouterModule.forRoot(MainRoutes, {useHash: true});
