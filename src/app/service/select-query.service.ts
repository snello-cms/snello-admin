import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {SELECT_QUERY_API_PATH} from "../../constants";
import {SelectQuery} from "../model/select-query";

@Injectable()
export class SelectQueryService extends AbstractService<SelectQuery> {
  constructor(protected http: HttpClient, messageService: MessageService) {
    super(SELECT_QUERY_API_PATH, http, messageService);
  }

  getId(element: SelectQuery) {
    return element.uuid;
  }


  buildSearch() {
    this.search = {
      uuid: '',
      _limit: 10
    };
  }


}
