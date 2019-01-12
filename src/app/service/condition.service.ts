import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Condition} from '../model/condtion';
import {CONDITION_API_PATH} from "../../constants";
import {AbstractService} from "../common/abstract-service";

@Injectable()
export class ConditionService extends AbstractService<Condition> {

  constructor(protected http: HttpClient) {
    super(CONDITION_API_PATH, http);
  }

  getId(element: Condition) {
    return element.uuid;
  }

  buildSearch() {
  }
}


