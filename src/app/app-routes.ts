import {Routes} from '@angular/router';
import {OutletComponent} from './common/outlet.component';
import {AppAuthGuard} from './service/app.authguard';
import {FieldDefinitionResolver} from './routes-guard/field-definition-resolver';

export const MainRoutes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./components/homepage/homepage.component').then(m => m.HomepageComponent),
        canActivate: [AppAuthGuard]
    },
    {
        path: 'extensions_admin',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/extensions_admin/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/extensions/extensions-list.component').then(m => m.ExtensionsListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/extensions/extensions-edit.component').then(m => m.ExtensionsEditComponent)},
            {path: 'new', loadComponent: () => import('./components/extensions/extensions-edit.component').then(m => m.ExtensionsEditComponent)}
        ]
    },
    {
        path: 'extensions/:id',
        loadComponent: () => import('./components/extensions/extensions-view.component').then(m => m.ExtensionsViewComponent),
        canActivate: [AppAuthGuard]
    },
    {
        path: 'adminpage',
        loadComponent: () => import('./components/admin-home/adminpage.component').then(m => m.AdminpageComponent),
        canActivate: [AppAuthGuard]
    },
    {
        path: 'metadata',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/metadata/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/metadata/metadata-list.component').then(m => m.MetadataListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/metadata/metadata-edit.component').then(m => m.MetadataEditComponent)},
            {path: 'new', loadComponent: () => import('./components/metadata/metadata-edit.component').then(m => m.MetadataEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./components/metadata/metadata-view.component').then(m => m.MetadataViewComponent)}
        ]
    },
    {
        path: 'fielddefinition',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/fielddefinition/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/field-definition/field-definition-list.component').then(m => m.FieldDefinitionListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/field-definition/field-definition-edit.component').then(m => m.FieldDefinitionEditComponent)},
            {path: 'new', loadComponent: () => import('./components/field-definition/field-definition-edit.component').then(m => m.FieldDefinitionEditComponent)},
        ]
    },
    {
        path: 'condition',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/condition/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/condition/condition-list.component').then(m => m.ConditionListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/condition/condition-edit.component').then(m => m.ConditionEditComponent)},
            {path: 'new', loadComponent: () => import('./components/condition/condition-edit.component').then(m => m.ConditionEditComponent)},
        ]
    },
    {
        path: 'document',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/document/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/documents/document-list.component').then(m => m.DocumentListComponent)},
            {path: 'new', loadComponent: () => import('./components/documents/document-edit.component').then(m => m.DocumentEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/documents/document-edit.component').then(m => m.DocumentEditComponent)}
        ]
    },
    {
        path: 'selectqueries',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/selectqueries/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/selectquery/select-query-list.component').then(m => m.SelectQueryListComponent)},
            {path: 'new', loadComponent: () => import('./components/selectquery/select-query-edit.component').then(m => m.SelectQueryEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/selectquery/select-query-edit.component').then(m => m.SelectQueryEditComponent)}
        ]
    },
    {
        path: 'links',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/links/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/links/links-list.component').then(m => m.LinksListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/links/links-edit.component').then(m => m.LinksEditComponent)},
            {path: 'new', loadComponent: () => import('./components/links/links-edit.component').then(m => m.LinksEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./components/links/links-view.component').then(m => m.LinksViewComponent)}
        ]
    },
    {
        path: 'draggables',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/draggables/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/draggable/draggable-list.component').then(m => m.DraggableListComponent)},
            {path: 'new', loadComponent: () => import('./components/draggable/draggable-edit.component').then(m => m.DraggableEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/draggable/draggable-edit.component').then(m => m.DraggableEditComponent)}
        ]
    },
    {
        path: 'droppables',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {path: '', redirectTo: '/droppables/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./components/droppable/droppable-list.component').then(m => m.DroppableListComponent)},
            {path: 'new', loadComponent: () => import('./components/droppable/droppable-edit.component').then(m => m.DroppableEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./components/droppable/droppable-edit.component').then(m => m.DroppableEditComponent)}
        ]
    },
    {
        path: 'datalistgeneral/list/:name',
        canActivate: [AppAuthGuard],
        loadComponent: () => import('./components/form-generation/form-generation-list-general.component').then(m => m.FormGenerationListGeneralComponent),
    },
    {
        path: 'datalist',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        children: [
            {
                path: 'list/:name',
                loadComponent: () => import('./components/form-generation/form-generation-list.component').then(m => m.FormGenerationListComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            },
            {
                path: 'new/:name',
                loadComponent: () => import('./components/form-generation/form-generation-edit.component').then(m => m.FormGenerationEditComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            },
            {
                path: 'edit/:name/:uuid',
                loadComponent: () => import('./components/form-generation/form-generation-edit.component').then(m => m.FormGenerationEditComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            },
            {
                path: 'view/:name/:uuid',
                loadComponent: () => import('./components/form-generation/form-generation-view.component').then(m => m.FormGenerationViewComponent),
                resolve: {
                    fieldDefinitionValorized: FieldDefinitionResolver
                }
            }
        ]
    },
    {path: '**', loadComponent: () => import('./components/homepage/homepage.component').then(m => m.HomepageComponent), canActivate: [AppAuthGuard]}
];
