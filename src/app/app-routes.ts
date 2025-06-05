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
import {FormGenerationListGeneralComponent} from './components/form-generation/form-generation-list-general.component';
import {MetadataViewComponent} from './components/metadata/metadata-view.component';
import {SelectQueryListComponent} from './components/selectquery/select-query-list.component';
import {SelectQueryEditComponent} from './components/selectquery/select-query-edit.component';
import {NgModule} from '@angular/core';
import {LinksListComponent} from './components/links/links-list.component';
import {LinksEditComponent} from './components/links/links-edit.component';
import {DraggableEditComponent} from './components/draggable/draggable-edit.component';
import {DraggableListComponent} from './components/draggable/draggable-list.component';
import {DroppableListComponent} from './components/droppable/droppable-list.component';
import {DroppableEditComponent} from './components/droppable/droppable-edit.component';
import {FormGenerationViewComponent} from './components/form-generation/form-generation-view.component';
import {LinksViewComponent} from './components/links/links-view.component';
import {ExtensionsViewComponent} from './components/extensions/extensions-view.component';
import {ExtensionsListComponent} from './components/extensions/extensions-list.component';
import {ExtensionsEditComponent} from './components/extensions/extensions-edit.component';
import {AppAuthGuard} from './service/app.authguard';

export const MainRoutes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomepageComponent,
        canActivate: [AppAuthGuard]
    },
    {
        path: 'extensions_admin',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/extensions_admin/list', pathMatch: 'full'},
            {path: 'list', component: ExtensionsListComponent},
            {path: 'edit/:id', component: ExtensionsEditComponent},
            {path: 'new', component: ExtensionsEditComponent}
        ]
    },
    {
        path: 'extensions/:id',
        component: ExtensionsViewComponent,
        canActivate: [AppAuthGuard]
    },
    {
        path: 'adminpage',
        component: AdminpageComponent,
        canActivate: [AppAuthGuard]
    },
    {
        path: 'metadata',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
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
        canActivate: [AppAuthGuard],
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
        canActivate: [AppAuthGuard],
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
        canActivate: [AppAuthGuard],
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
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/selectqueries/list', pathMatch: 'full'},
            {path: 'list', component: SelectQueryListComponent},
            {path: 'new', component: SelectQueryEditComponent},
            {path: 'edit/:id', component: SelectQueryEditComponent}

        ]
    },
    {
        path: 'links',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/links/list', pathMatch: 'full'},
            {path: 'list', component: LinksListComponent},
            {path: 'edit/:id', component: LinksEditComponent},
            {path: 'new', component: LinksEditComponent},
            {path: 'view/:id', component: LinksViewComponent}
        ]
    },
    {
        path: 'draggables',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/draggables/list', pathMatch: 'full'},
            {path: 'list', component: DraggableListComponent},
            {path: 'new', component: DraggableEditComponent},
            {path: 'edit/:id', component: DraggableEditComponent}

        ]
    },
    {
        path: 'droppables',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/droppables/list', pathMatch: 'full'},
            {path: 'list', component: DroppableListComponent},
            {path: 'new', component: DroppableEditComponent},
            {path: 'edit/:id', component: DroppableEditComponent}

        ]
    },
    {
        path: 'datalistgeneral/list/:name',
        canActivate: [AppAuthGuard],
        component: FormGenerationListGeneralComponent,
    },
    {
        path: 'datalist',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
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
            {
                path: 'view/:name/:uuid',
                component: FormGenerationViewComponent,
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            }
        ]
    },
    {path: '**', component: HomepageComponent, canActivate: [AppAuthGuard]}
];

@NgModule({
    imports: [
        RouterModule.forRoot(MainRoutes, {useHash: true, preloadingStrategy: PreloadAllModules}),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
