import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FIELD_DEFINITION_API_PATH} from "../../constants";
import {AbstractService} from "../common/abstract-service";
import {FieldDefinition} from "../model/field-definition";

@Injectable()
export class FieldDefinitionService extends AbstractService<FieldDefinition> {

  constructor(protected http: HttpClient) {
    super(FIELD_DEFINITION_API_PATH, http);
  }

  getId(element: FieldDefinition) {
    return element.uuid;
  }

  buildSearch() {
  }
}


