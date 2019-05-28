import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {USER_API_PATH} from '../../constants';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {User} from "../model/user";

@Injectable()
export class UserService extends AbstractService<User> {

  constructor(protected http: HttpClient, messageService: MessageService) {
    super(USER_API_PATH, http, messageService);
  }

  getId(element: User) {
    return element.username;
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


