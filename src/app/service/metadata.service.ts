import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Metadata} from '../model/metadata';
import {METADATA_API_PATH} from "../../constants";
import {Observable} from "rxjs";
import {AbstractService} from "../common/abstract-service";
import {FieldDefinition} from "../model/field-definition";
import {catchError, map} from "rxjs/operators";

@Injectable()
export class MetadataService extends AbstractService<Metadata> {

  constructor(protected http: HttpClient) {
    super(METADATA_API_PATH, http);
  }

  getId(element: Metadata) {
    return element.uuid;
  }

  generateFieldDefinition(arrayFromServer: FieldDefinition[], valuesMap: Map<string, any>, visualization: string): FieldDefinition[] {
    let i;
    for (i = 0; i < arrayFromServer.length; i++) {
      arrayFromServer[i].value = valuesMap.get(arrayFromServer[i].name);
    }
    return;
  }

  viewMetadata(name: string, id: string): Observable<FieldDefinition[]> {
    return null;
  }

  newMetadata(name: string): Observable<FieldDefinition[]> {
    return null;
  }

  buildSearch() {
  }

  public createTable(metadata: Metadata) {
    return this.httpClient.get(this.url + '/' + metadata.uuid + '/create', {
      observe: 'response',
    }).pipe(
      map(res => {
        const t: any = <any>res.body; // json();
        return t;
      }),
      catchError(this.handleError)
    );
  }
}


