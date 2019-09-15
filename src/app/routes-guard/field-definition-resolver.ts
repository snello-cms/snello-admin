import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {FieldDefinition} from '../model/field-definition';
import {ApiService} from '../service/api.service';
import {DataListService} from '../service/data-list.service';
import {Injectable} from '@angular/core';
import {MetadataService} from '../service/metadata.service';

@Injectable()
export class FieldDefinitionResolver implements Resolve<FieldDefinition[]> {
  constructor(private dataListService: DataListService,
              private metadataSerive: MetadataService,
              private router: Router,
              private apiService: ApiService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FieldDefinition[]> | Observable<never> {
    let key = route.paramMap.get('uuid');
    let name = route.paramMap.get('name');
    let fieldDefinitionList: any;
    return this.dataListService.getFieldDefinitionList(name).pipe(
      switchMap(
        el => {
          fieldDefinitionList = el;
          if (name) {
            return this.apiService.fetch(name, key);
          } else {
            return of(null);
          }
        }
      ),
      map(
        element => {
          if (element != null) {
            for (let definition_1 of fieldDefinitionList) {
              definition_1.is_edit = true;
              if (element.hasOwnProperty(definition_1.name)) {
                definition_1.value = element[definition_1.name];
              }
              definition_1.table_name = name;
              definition_1.table_key_value = element.uuid;
            }
          }
          return <FieldDefinition[]>fieldDefinitionList;
        }
      )
    );
  }
}
