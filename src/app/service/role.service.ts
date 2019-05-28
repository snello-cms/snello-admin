import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ROLE_API_PATH} from '../../constants';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {Role} from "../model/role";

@Injectable()
export class RoleService extends AbstractService<Role> {

  constructor(protected http: HttpClient, messageService: MessageService) {
    super(ROLE_API_PATH, http, messageService);
  }

  getId(element: Role) {
    return element.name;
  }

  buildSearch() {
    this.search = {
      name_contains: '',
      uuid: '',
      metadata_uuid: '',
      _limit: 10
    };
  }
}


