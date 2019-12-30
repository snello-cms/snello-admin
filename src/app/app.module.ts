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
import {LinksEditComponent} from './components/links/links-edit.component';
import {LinksListComponent} from './components/links/links-list.component';
import {SideBarComponent} from './components/sidebar/sidebar.component';
import {PermitDirective} from './directives/permit.directive';
import {CommonModule, registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {ConfigurationService} from './service/configuration.service';
import {DraggableEditComponent} from './components/draggable/draggable-edit.component';
import {DraggableListComponent} from './components/draggable/draggable-list.component';
import {DroppableListComponent} from './components/droppable/droppable-list.component';
import {DroppableEditComponent} from './components/droppable/droppable-edit.component';
import {EditorModule} from '@tinymce/tinymce-angular';
import {TinymceComponent} from './generic.components/tinymce/tinymce.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {InputViewComponent} from './generic.components/input/input-view.component';
import {FormGenerationViewComponent} from './components/form-generation/form-generation-view.component';
import {RouterModule} from '@angular/router';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {CheckboxModule} from 'primeng/checkbox';
import {CalendarModule} from 'primeng/calendar';
import {TableModule} from 'primeng/table';
import {ChipsModule} from 'primeng/chips';
import {InputSwitchModule} from 'primeng/inputswitch';
import {DropdownModule} from 'primeng/dropdown';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {PanelModule} from 'primeng/panel';
import {FileUploadModule} from 'primeng/fileupload';
import {MultiSelectModule} from 'primeng/multiselect';
import {ToastModule} from 'primeng/toast';
import {LoginComponent} from './components/login/login.component';
import {EditorModule as primengEditorModule} from 'primeng/editor';
import {ChartModule} from 'primeng/chart';
import {BlockUIModule} from 'primeng/blockui';
import {FieldsetModule} from 'primeng/fieldset';
import {ProgressBarModule} from 'primeng/progressbar';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TabViewModule} from 'primeng/tabview';
import {ButtonModule} from 'primeng/button';
import {SidebarModule} from 'primeng/sidebar';
import {HtmlViewComponent} from './generic.components/input/html-view.component';
import {LinksViewComponent} from './components/links/links-view.component';
import {JoinViewComponent} from './generic.components/join/join-view.component';
import {MultiJoinViewComponent} from './generic.components/multi-join/multi-join-view.component';
import {MonacoComponent} from './generic.components/monaco/monaco.component';
import {MediaViewComponent} from './generic.components/media/media-view.component';
import {CopyClipboardDirective} from './directives/copy-clipboard.directive';
import {YourselfEditComponent} from './components/user/yourself-edit.component';
import {ExtensionsViewComponent} from './components/extensions/extensions-view.component';
import {MonacoEditorModule} from 'ngx-monaco-editor';
import {ExtensionsListComponent} from './components/extensions/extensions-list.component';
import {ExtensionsEditComponent} from './components/extensions/extensions-edit.component';
import {PasswordResetComponent} from './components/password-reset/password.reset.component';
import {PasswordChangeComponent} from './components/password-change/password.change.component';

registerLocaleData(localeIt);

export function loadConfigurations(configService: ConfigurationService) {
    return () => configService.getConfigs();
}

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        SideBarComponent,
        AdminpageComponent,
        AdminhomeTopBar,
        HomepageTopBar,
        HomepageComponent,
        ExtensionsViewComponent,
        ExtensionsEditComponent,
        ExtensionsListComponent,
        TagComponent,
        InputComponent,
        InputViewComponent,
        HtmlViewComponent,
        MultiJoinViewComponent,
        MonacoComponent,
        JoinViewComponent,
        SelectComponent,
        JoinComponent,
        MultiJoinComponent,
        TagComponent,
        DateComponent,
        DatetimeComponent,
        TimeComponent,
        MediaComponent,
        MediaViewComponent,
        TextAreaComponent,
        PasswordChangeComponent,
        PasswordResetComponent,
        CheckboxComponent,
        CopyClipboardDirective,
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
        FormGenerationViewComponent,
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
        LinksViewComponent,
        PermitDirective,
        DraggableEditComponent,
        DraggableListComponent,
        DroppableListComponent,
        DroppableEditComponent,
        TinymceComponent,

        LoginComponent,
        YourselfEditComponent
    ],
    imports: [
        primengEditorModule,
        ChartModule,
        BrowserModule,
        EditorModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        HttpClientModule,
        // PRIME NG
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
        ButtonModule,
        RadioButtonModule,
        SidebarModule,
        MonacoEditorModule
    ],
    entryComponents: [
        InputViewComponent,
        HtmlViewComponent,
        MultiJoinViewComponent,
        JoinViewComponent,
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
        MediaViewComponent,
        TinymceComponent,
        MonacoComponent
    ],
    providers: [
        [MessageService, ConfirmationService,
            {
                provide: APP_INITIALIZER,
                useFactory: loadConfigurations,
                multi: true,
                deps: [ConfigurationService]
            },
            {
                provide: HTTP_INTERCEPTORS,
                useClass: AuthenticationInterceptor,
                multi: true
            }
        ]
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
