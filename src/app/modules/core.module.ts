import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MetadataService} from '../service/metadata.service';
import {ApiService} from '../service/api.service';
import {ConditionService} from '../service/condition.service';
import {DocumentService} from '../service/document.service';
import {FieldDefinitionService} from '../service/field-definition.service';
import {DataListService} from '../service/data-list.service';
import {FieldDefinitionResolver} from '../routes-guard/field-definition-resolver';
import {ConfirmationService, MessageService} from 'primeng/api';
import {PublicDatasService} from '../service/public-data.service';
import {SelectQueryService} from '../service/select-query.service';
import {UserService} from '../service/user.service';
import {RoleService} from '../service/role.service';
import {UserRoleService} from '../service/user-role.service';
import {UrlMapRuleService} from '../service/url-map-rule.service';
import {AuthenticationService} from '../service/authentication.service';
import {LinksService} from '../service/links.service';
import {DraggableService} from '../service/draggable.service';
import {DroppableService} from '../service/droppable.service';

@NgModule({
  imports: [
    CommonModule
  ],

})

export class CoreModule {

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        MetadataService,
        ApiService,
        ConditionService,
        DocumentService,
        FieldDefinitionService,
        DataListService,
        FieldDefinitionResolver,
        MessageService,
        ConfirmationService,
        PublicDatasService,
        SelectQueryService,
        UserService,
        RoleService,
        UserRoleService,
        UrlMapRuleService,
        AuthenticationService,
        LinksService,
        DraggableService,
        DroppableService
      ]
    };

  }
}

