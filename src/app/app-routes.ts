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
        canActivate: [AppAuthGuard],
        data: { requiresGroup: true }
    },
    {
        // authenticated, but nothing to show: neither Admin/Manager nor in a table group (no guard on purpose)
        path: 'no-access',
        loadComponent: () => import('./pages/no-access/no-access.component').then(m => m.NoAccessComponent)
    },
    {
        path: 'adminpage',
        loadComponent: () => import('./pages/admin-home/adminpage.component').then(m => m.AdminpageComponent),
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] }
    },
    {
        path: 'metadata',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/metadata/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/metadata/metadata-list.component').then(m => m.MetadataListComponent)},
            {path: 'wizard', loadComponent: () => import('./pages/metadata/metadata-wizard.component').then(m => m.MetadataWizardComponent)},
            {path: 'export', loadComponent: () => import('./pages/metadata/metadata-export.component').then(m => m.MetadataExportComponent)},
            {path: 'import', loadComponent: () => import('./pages/metadata/metadata-import.component').then(m => m.MetadataImportComponent)},
            {path: 'introspect', loadComponent: () => import('./pages/metadata/metadata-introspect.component').then(m => m.MetadataIntrospectComponent)},
            {path: 'change-order/:id', loadComponent: () => import('./pages/metadata/metadata-field-definition-order.component').then(m => m.MetadataFieldDefinitionOrderComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/metadata/metadata-edit.component').then(m => m.MetadataEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/metadata/metadata-edit.component').then(m => m.MetadataEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/metadata/metadata-view.component').then(m => m.MetadataViewComponent)}
        ]
    },
    {
        path: 'fielddefinition',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
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
        data: { roles: ['Admin', 'Manager'] },
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
        data: { roles: ['Admin', 'Manager'] },
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
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/images/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/images/images-list.component').then(m => m.ImagesListComponent)},
            {path: 'edit/:uuid', loadComponent: () => import('./pages/images/image-editor.component').then(m => m.ImageEditorComponent)}
        ]
    },
    {
        path: 'videos',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/videos/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/videos/videos-list.component').then(m => m.VideosListComponent)}
        ]
    },
    {
        path: 'selectqueries',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
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
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/links/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/links/links-list.component').then(m => m.LinksListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/links/links-edit.component').then(m => m.LinksEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/links/links-edit.component').then(m => m.LinksEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/links/links-view.component').then(m => m.LinksViewComponent)}
        ]
    },
    {
        path: 'actions',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/actions/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/actions/actions-list.component').then(m => m.ActionsListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/actions/actions-edit.component').then(m => m.ActionsEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/actions/actions-edit.component').then(m => m.ActionsEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/actions/actions-view.component').then(m => m.ActionsViewComponent)}
        ]
    },
    {
        path: 'scheduledactions',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/scheduledactions/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/scheduled-actions/scheduled-actions-list.component').then(m => m.ScheduledActionsListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/scheduled-actions/scheduled-actions-edit.component').then(m => m.ScheduledActionsEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/scheduled-actions/scheduled-actions-edit.component').then(m => m.ScheduledActionsEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/scheduled-actions/scheduled-actions-view.component').then(m => m.ScheduledActionsViewComponent)}
        ]
    },
    {
        path: 'printtemplates',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/printtemplates/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/print-templates/print-templates-list.component').then(m => m.PrintTemplatesListComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/print-templates/print-templates-edit.component').then(m => m.PrintTemplatesEditComponent)},
            {path: 'new', loadComponent: () => import('./pages/print-templates/print-templates-edit.component').then(m => m.PrintTemplatesEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/print-templates/print-templates-view.component').then(m => m.PrintTemplatesViewComponent)}
        ]
    },
    {
        path: 'datalistgeneral/list/:name',
        canActivate: [AppAuthGuard],
        data: { requiresGroup: true },
        loadComponent: () => import('./pages/form-generation/form-generation-list-general.component').then(m => m.FormGenerationListGeneralComponent),
    },
    {
        path: 'calendar/list/:name',
        canActivate: [AppAuthGuard],
        data: { requiresGroup: true },
        loadComponent: () => import('./pages/form-generation/form-generation-calendar.component').then(m => m.FormGenerationCalendarComponent),
    },
    {
        path: 'datalist',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { requiresGroup: true },
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
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/massive/metadata', pathMatch: 'full'},
            {path: 'metadata', loadComponent: () => import('./pages/massive/massive-metadata-select.component').then(m => m.MassiveMetadataSelectComponent)},
            {path: 'attributes/:name', loadComponent: () => import('./pages/massive/massive-attributes-select.component').then(m => m.MassiveAttributesSelectComponent), resolve: {fieldDefinitionValorized: FieldDefinitionResolver}},
            {path: 'edit/:name', loadComponent: () => import('./pages/massive/massive-data-edit.component').then(m => m.MassiveDataEditComponent), resolve: {fieldDefinitionValorized: FieldDefinitionResolver}}
        ]
    },
    // AI: a project groups skills, MCP tools, cards and service accounts (snello-api /api/ai/*)
    {
        path: 'ai-projects',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin'] },
        children: [
            {path: '', redirectTo: '/ai-projects/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/ai/projects/ai-project-list.component').then(m => m.AiProjectListComponent)},
            {path: 'new', loadComponent: () => import('./pages/ai/projects/ai-project-edit.component').then(m => m.AiProjectEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/ai/projects/ai-project-edit.component').then(m => m.AiProjectEditComponent)}
        ]
    },
    {
        path: 'ai-skills',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin'] },
        children: [
            {path: '', redirectTo: '/ai-skills/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/ai/skills/ai-skill-list.component').then(m => m.AiSkillListComponent)},
            {path: 'new', loadComponent: () => import('./pages/ai/skills/ai-skill-edit.component').then(m => m.AiSkillEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/ai/skills/ai-skill-edit.component').then(m => m.AiSkillEditComponent)}
        ]
    },
    {
        path: 'ai-mcptools',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin'] },
        children: [
            {path: '', redirectTo: '/ai-mcptools/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/ai/mcp-tools/ai-mcp-tool-list.component').then(m => m.AiMcpToolListComponent)},
            {path: 'new', loadComponent: () => import('./pages/ai/mcp-tools/ai-mcp-tool-edit.component').then(m => m.AiMcpToolEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/ai/mcp-tools/ai-mcp-tool-edit.component').then(m => m.AiMcpToolEditComponent)}
        ]
    },
    {
        path: 'ai-cards',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin'] },
        children: [
            {path: '', redirectTo: '/ai-cards/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/ai/cards/ai-ui-card-list.component').then(m => m.AiUiCardListComponent)},
            {path: 'new', loadComponent: () => import('./pages/ai/cards/ai-ui-card-edit.component').then(m => m.AiUiCardEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/ai/cards/ai-ui-card-edit.component').then(m => m.AiUiCardEditComponent)}
        ]
    },
    {
        path: 'ai-serviceaccounts',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin'] },
        children: [
            {path: '', redirectTo: '/ai-serviceaccounts/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/ai/service-accounts/ai-service-account-list.component').then(m => m.AiServiceAccountListComponent)},
            {path: 'new', loadComponent: () => import('./pages/ai/service-accounts/ai-service-account-edit.component').then(m => m.AiServiceAccountEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/ai/service-accounts/ai-service-account-edit.component').then(m => m.AiServiceAccountEditComponent)}
        ]
    },
    {
        path: 'ai-history',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin'] },
        children: [
            {path: '', redirectTo: '/ai-history/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/ai/history/ai-history-list.component').then(m => m.AiHistoryListComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/ai/history/ai-history-view.component').then(m => m.AiHistoryViewComponent)}
        ]
    },
    {
        path: 'auth-users',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/auth-users/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/auth/auth-users-list.component').then(m => m.AuthUsersListComponent)},
            {path: 'new', loadComponent: () => import('./pages/auth/auth-users-edit.component').then(m => m.AuthUsersEditComponent)},
            {path: 'view/:id', loadComponent: () => import('./pages/auth/auth-users-view.component').then(m => m.AuthUsersViewComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/auth/auth-users-edit.component').then(m => m.AuthUsersEditComponent)}
        ]
    },
    {
        path: 'auth-groups',
        component: OutletComponent,
        canActivate: [AppAuthGuard],
        data: { roles: ['Admin', 'Manager'] },
        children: [
            {path: '', redirectTo: '/auth-groups/list', pathMatch: 'full'},
            {path: 'list', loadComponent: () => import('./pages/auth/auth-groups-list.component').then(m => m.AuthGroupsListComponent)},
            {path: 'new', loadComponent: () => import('./pages/auth/auth-groups-edit.component').then(m => m.AuthGroupsEditComponent)},
            {path: 'edit/:id', loadComponent: () => import('./pages/auth/auth-groups-edit.component').then(m => m.AuthGroupsEditComponent)}
        ]
    },
    {path: '**', loadComponent: () => import('./pages/homepage/homepage.component').then(m => m.HomepageComponent), canActivate: [AppAuthGuard]}
];
