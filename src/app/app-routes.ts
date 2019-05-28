import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {OutletComponent} from './common/outlet.component';
import {MetadataListComponent} from './components/metadata/metadata-list.component';
import {MetadataEditComponent} from './components/metadata/metadata-edit.component';
import {FieldDefinitionListComponent} from './components/field-definition/field-definition-list.component';
import {FieldDefinitionEditComponent} from './components/field-definition/field-definition-edit.component';
import {ConditionListComponent} from './components/condition/condition-list.component';
import {HomepageComponent} from './components/homepage/homepage.component';
import {ConditionEditComponent} from './components/condition/condition-edit.component';
import {FormGenerationListComponent} from './components/form-generation/form-generation-list.component';
import {FormGenerationEditComponent} from './components/form-generation/form-generation-edit.component';
import {DocumentListComponent} from './components/documents/document-list.component';
import {FieldDefinitionResolver} from './routes-guard/field-definition-resolver';
import {AdminpageComponent} from './components/admin-home/adminpage.component';
import {DocumentEditComponent} from './components/documents/document-edit.component';
import {FormGenerationListGeneralComponent} from "./components/form-generation/form-generation-list-general.component";
import {MetadataViewComponent} from "./components/metadata/metadata-view.component";
import {PublicDataComponent} from "./components/public-data/public-data.component";
import {SelectQueryListComponent} from "./components/selectquery/select-query-list.component";
import {SelectQueryEditComponent} from "./components/selectquery/select-query-edit.component";
import {UserListComponent} from "./components/user/user-list.component";
import {UserEditComponent} from "./components/user/user-edit.component";
import {RoleListComponent} from "./components/role/role-list.component";
import {RoleEditComponent} from "./components/role/role-edit.component";
import {UrlmapruleListComponent} from "./components/urlmaprule/urlmaprule-list.component";
import {UrlmapruleEditComponent} from "./components/urlmaprule/urlmaprule-edit.component";
import {NgModule} from "@angular/core";
import {LinksListComponent} from "./components/links/links-list.component";
import {LinksEditComponent} from "./components/links/links-edit.component";

export const MainRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadChildren: './modules/login.module#LoginModule'
  },
  {
    path: 'home',
    component: HomepageComponent,
  },
  {
    path: 'adminpage',
    component: AdminpageComponent,
  },
  {
    path: 'metadata',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/metadata/list', pathMatch: 'full'},
      {path: 'list', component: MetadataListComponent},
      {path: 'edit/:id', component: MetadataEditComponent},
      {path: 'new', component: MetadataEditComponent},
      {path: 'view/:id', component: MetadataViewComponent}
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
      {path: 'list', component: DocumentListComponent},
      {path: 'new', component: DocumentEditComponent},
      {path: 'edit/:id', component: DocumentEditComponent}

    ]
  },
  {
    path: 'selectqueries',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/selectqueries/list', pathMatch: 'full'},
      {path: 'list', component: SelectQueryListComponent},
      {path: 'new', component: SelectQueryEditComponent},
      {path: 'edit/:id', component: SelectQueryEditComponent}

    ]
  },
  {
    path: 'user',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/user/list', pathMatch: 'full'},
      {path: 'list', component: UserListComponent},
      {path: 'new', component: UserEditComponent},
      {path: 'edit/:id', component: UserEditComponent}

    ]
  },
  {
    path: 'urlmaprules',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/urlmaprules/list', pathMatch: 'full'},
      {path: 'list', component: UrlmapruleListComponent},
      {path: 'new', component: UrlmapruleEditComponent},
      {path: 'edit/:id', component: UrlmapruleEditComponent}

    ]
  },
  {
    path: 'role',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/role/list', pathMatch: 'full'},
      {path: 'list', component: RoleListComponent},
      {path: 'new', component: RoleEditComponent},
      {path: 'edit/:id', component: RoleEditComponent}

    ]
  },
  {
    path: 'links',
    component: OutletComponent,
    children: [
      {path: '', redirectTo: '/links/list', pathMatch: 'full'},
      {path: 'list', component: LinksListComponent},
      {path: 'edit/:id', component: LinksEditComponent},
      {path: 'new', component: LinksEditComponent}

    ]
  },
  {
    path: 'datalistgeneral/list/:name',
    component: FormGenerationListGeneralComponent,
  },

  {
    path: 'publicdata/edit',
    component: PublicDataComponent,
  },
  {
    path: 'datalist',
    component: OutletComponent,
    children: [
      {
        path: 'list/:name',
        component: FormGenerationListComponent,
        resolve: {
          fieldDefinitionValorized: FieldDefinitionResolver
        }
      },
      {
        path: 'new/:name',
        component: FormGenerationEditComponent,
        resolve: {
          fieldDefinitionValorized: FieldDefinitionResolver
        }
      },
      {
        path: 'edit/:name/:uuid',
        component: FormGenerationEditComponent,
        resolve: {
          fieldDefinitionValorized: FieldDefinitionResolver
        }
      },
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(MainRoutes, {useHash: false, preloadingStrategy: PreloadAllModules}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
