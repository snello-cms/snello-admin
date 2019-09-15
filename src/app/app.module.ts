import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppRoutingModule} from './app-routes';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {InputComponent} from './generic.components/input/input.component';
import {SelectComponent} from './generic.components/select/select.component';
import {DateComponent} from './generic.components/date/date.component';
import {CheckboxComponent} from './generic.components/checkbox/checkbox.component';
import {DynamicFieldDirective} from './generic.components/dynamic-field/dynamic-field.directive';
import {DynamicFormComponent} from './generic.components/dynamic-form/dynamic-form.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MetadataEditComponent} from './components/metadata/metadata-edit.component';
import {MetadataListComponent} from './components/metadata/metadata-list.component';
import {OutletComponent} from './common/outlet.component';
import {FieldDefinitionEditComponent} from './components/field-definition/field-definition-edit.component';
import {FieldDefinitionListComponent} from './components/field-definition/field-definition-list.component';
import {ConditionListComponent} from './components/condition/condition-list.component';
import {HomepageComponent} from './components/homepage/homepage.component';
import {ConditionEditComponent} from './components/condition/condition-edit.component';
import {FormGenerationMetadataListComponent} from './components/form-generation/form-generation-metadata-list.component';
import {FormGenerationListComponent} from './components/form-generation/form-generation-list.component';
import {FormGenerationEditComponent} from './components/form-generation/form-generation-edit.component';
import {TextAreaComponent} from './generic.components/textarea/textarea.component';
import {DocumentListComponent} from './components/documents/document-list.component';
import {InputTextModule} from 'primeng/inputtext';
import {TagComponent} from './generic.components/tag/tag.component';
import {AdminpageComponent} from './components/admin-home/adminpage.component';
import {AdminhomeTopBar} from './components/adminhome-topbar/adminhome-topbar.component';
import {HomepageTopBar} from './components/homepage-topbar/homepage-topbar.component';
import {DocumentEditComponent} from './components/documents/document-edit.component';
import {FormGenerationListGeneralComponent} from './components/form-generation/form-generation-list-general.component';
import {RouterOutletComponent} from './common/router-outlet.component';
import {JoinComponent} from './generic.components/join/join.component';
import {DatetimeComponent} from './generic.components/datetime/datetime.component';
import {MetadataViewComponent} from './components/metadata/metadata-view.component';
import {TimeComponent} from './generic.components/time/time.component';
import {MultiJoinComponent} from './generic.components/multi-join/multi-join.component';
import {MediaComponent} from './generic.components/media/media.component';
import {PublicDataComponent} from './components/public-data/public-data.component';
import {SelectQueryEditComponent} from './components/selectquery/select-query-edit.component';
import {SelectQueryListComponent} from './components/selectquery/select-query-list.component';
import {DynamicSearchFormComponent} from './generic.components/dynamic-form/dynamic-search-form.component';
import {UserEditComponent} from './components/user/user-edit.component';
import {UserListComponent} from './components/user/user-list.component';
import {RoleEditComponent} from './components/role/role-edit.component';
import {RoleListComponent} from './components/role/role-list.component';
import {UrlmapruleEditComponent} from './components/urlmaprule/urlmaprule-edit.component';
import {UrlmapruleListComponent} from './components/urlmaprule/urlmaprule-list.component';
import {AuthenticationInterceptor} from './service/http-interceptors/authentication-interceptor.service';
import {MainComponent} from './components/main/main.component';
import {CoreModule} from './modules/core.module';
import {SharedModule} from './modules/shared.module';
import {LinksEditComponent} from './components/links/links-edit.component';
import {LinksListComponent} from './components/links/links-list.component';
import {SideBarComponent} from './components/sidebar/sidebar.component';
import {PermitDirective} from './directives/permit.directive';
import {AuthenticationService} from './service/authentication.service';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {ConfigurationService} from './service/configuration.service';
import {initializer} from './routes-guard/app-init';
import {DraggableEditComponent} from './components/draggable/draggable-edit.component';
import {DraggableListComponent} from './components/draggable/draggable-list.component';
import {DroppableListComponent} from './components/droppable/droppable-list.component';
import {DroppableEditComponent} from './components/droppable/droppable-edit.component';
import {TinymceComponent} from './generic.components/tinymce/tinymce.component';
import {EditorModule} from '@tinymce/tinymce-angular';

registerLocaleData(localeIt);

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        SideBarComponent,
        AdminpageComponent,
        AdminhomeTopBar,
        HomepageTopBar,
        HomepageComponent,
        TagComponent,
        InputComponent,
        SelectComponent,
        JoinComponent,
        MultiJoinComponent,
        TagComponent,
        DateComponent,
        DatetimeComponent,
        TimeComponent,
        MediaComponent,
        TextAreaComponent,
        CheckboxComponent,
        DynamicFieldDirective,
        DynamicFormComponent,
        DynamicSearchFormComponent,
        MetadataEditComponent,
        MetadataViewComponent,
        MetadataListComponent,
        FieldDefinitionEditComponent,
        FieldDefinitionListComponent,
        ConditionListComponent,
        ConditionEditComponent,
        DocumentEditComponent,
        DocumentListComponent,
        FormGenerationMetadataListComponent,
        FormGenerationListComponent,
        FormGenerationEditComponent,
        SelectQueryEditComponent,
        SelectQueryListComponent,
        PublicDataComponent,
        OutletComponent,
        FormGenerationListGeneralComponent,
        RouterOutletComponent,
        UserEditComponent,
        UserListComponent,
        RoleEditComponent,
        RoleListComponent,
        UrlmapruleEditComponent,
        UrlmapruleListComponent,
        LinksEditComponent,
        LinksListComponent,
        PermitDirective,
        DraggableEditComponent,
        DraggableListComponent,
        DroppableListComponent,
        DroppableEditComponent,
        TinymceComponent
    ],
    imports: [
        CoreModule.forRoot(),
        SharedModule,
        BrowserModule,
        EditorModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        HttpClientModule,
    ],
    entryComponents: [
        InputComponent,
        SelectComponent,
        JoinComponent,
        MultiJoinComponent,
        DateComponent,
        DatetimeComponent,
        TextAreaComponent,
        CheckboxComponent,
        TagComponent,
        TimeComponent,
        MediaComponent,
        TinymceComponent
    ],
    providers: [
        [
            AuthenticationService,
            ConfigurationService,
            {
                provide: HTTP_INTERCEPTORS,
                useClass: AuthenticationInterceptor,
                multi: true
            },
            {
                provide: APP_INITIALIZER,
                useFactory: initializer,
                multi: true,
                deps: [ConfigurationService]
            }
        ]
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
