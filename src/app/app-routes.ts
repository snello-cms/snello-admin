import {Routes} from '@angular/router';
import {OutletComponent} from './common/outlet.component';
import {AppAuthGuard} from './services/app.authguard';
import {FieldDefinitionResolver} from './routes-guard/field-definition-resolver';

export const MainRoutes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/homepage/homepage.component').then(m => m.HomepageComponent),
        canActivate: [AppAuthGuard]
    },
    {
        path: 'adminpage',
        loadComponent: () => import('./pages/admin-home/adminpage.component').then(m => m.AdminpageComponent),
        canActivate: [AppAuthGuard]
    },
    {
        path: 'metadata',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/metadata/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/metadata/metadata-list.component').then(m => m.MetadataListComponent)},
            {path: 'export', loadComponent: () => import('./pages/metadata/metadata-export.component').then(m => m.MetadataExportComponent)},
            {path: 'import', loadComponent: () => import('./pages/metadata/metadata-import.component').then(m => m.MetadataImportComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/metadata/metadata-edit.component').then(m => m.MetadataEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/metadata/metadata-edit.component').then(m => m.MetadataEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/metadata/metadata-view.component').then(m => m.MetadataViewComponent)}
        ]
    },
    {
        path: 'fielddefinition',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/fielddefinition/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/field-definition/field-definition-list.component').then(m => m.FieldDefinitionListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/field-definition/field-definition-edit.component').then(m => m.FieldDefinitionEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/field-definition/field-definition-edit.component').then(m => m.FieldDefinitionEditComponent)},
        ]
    },
    {
        path: 'condition',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/condition/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/conditions/condition-list.component').then(m => m.ConditionListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/conditions/condition-edit.component').then(m => m.ConditionEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/conditions/condition-edit.component').then(m => m.ConditionEditComponent)},
        ]
    },
    {
        path: 'document',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/document/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/documents/document-list.component').then(m => m.DocumentListComponent)},
            {path: 'new', loadComponent: () => import('./pages/documents/document-edit.component').then(m => m.DocumentEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/documents/document-edit.component').then(m => m.DocumentEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/documents/document-view.component').then(m => m.DocumentViewComponent)}
        ]
    },
    {
        path: 'images',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/images/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/images/images-list.component').then(m => m.ImagesListComponent)},
            {path: 'edit/:uuid', loadComponent: () => import('./pages/images/image-editor.component').then(m => m.ImageEditorComponent)}
        ]
    },
    {
        path: 'selectqueries',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/selectqueries/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/selectquery/select-query-list.component').then(m => m.SelectQueryListComponent)},
            {path: 'new', loadComponent: () => import('./pages/selectquery/select-query-edit.component').then(m => m.SelectQueryEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/selectquery/select-query-edit.component').then(m => m.SelectQueryEditComponent)}
        ]
    },
    {
        path: 'links',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/links/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/links/links-list.component').then(m => m.LinksListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/links/links-edit.component').then(m => m.LinksEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/links/links-edit.component').then(m => m.LinksEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/links/links-view.component').then(m => m.LinksViewComponent)}
        ]
    },
    {
        path: 'datalistgeneral/list/:name',
        canActivate: [AppAuthGuard],
        loadComponent: () => import('./pages/form-generation/form-generation-list-general.component').then(m => m.FormGenerationListGeneralComponent),
    },
    {
        path: 'datalist',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {
                path: 'list/:name',
                loadComponent: () => import('./pages/form-generation/form-generation-list.component').then(m => m.FormGenerationListComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            },
            {
                path: 'new/:name',
                loadComponent: () => import('./pages/form-generation/form-generation-edit.component').then(m => m.FormGenerationEditComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            },
            {
                path: 'edit/:name/:uuid',
                loadComponent: () => import('./pages/form-generation/form-generation-edit.component').then(m => m.FormGenerationEditComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            },
            {
                path: 'view/:name/:uuid',
                loadComponent: () => import('./pages/form-generation/form-generation-view.component').then(m => m.FormGenerationViewComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            }
        ]
    },
    {
        path: 'massive',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/massive/metadata', pathMatch: 'full'},
            {path: 'metadata', loadComponent: () => import('./pages/massive/massive-metadata-select.component').then(m => m.MassiveMetadataSelectComponent)},
            {path: 'attributes/:name', loadComponent: () => import('./pages/massive/massive-attributes-select.component').then(m => m.MassiveAttributesSelectComponent), resolve: {fieldDefinitionValorized: FieldDefinitionResolver}},
            {path: 'edit/:name', loadComponent: () => import('./pages/massive/massive-data-edit.component').then(m => m.MassiveDataEditComponent), resolve: {fieldDefinitionValorized: FieldDefinitionResolver}}
        ]
    },
    {
        path: 'chatinteractions',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/chatinteractions/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/chat-interactions/chat-interaction-list.component').then(m => m.ChatInteractionListComponent)},
        ]
    },
    {path: '**', loadComponent: () => import('./pages/homepage/homepage.component').then(m => m.HomepageComponent), canActivate: [AppAuthGuard]}
];
