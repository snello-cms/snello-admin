import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Metadata} from '../model/metadata';
import {METADATA_API_PATH, PUBLIC_DATA_API_PATH} from '../../constants';
import {Observable} from 'rxjs';
import {AbstractService} from '../common/abstract-service';
import {FieldDefinition} from '../model/field-definition';
import {catchError, map} from 'rxjs/operators';
import {MessageService} from 'primeng/api';

@Injectable()
export class PublicDatasService extends AbstractService<any> {

  private nameToMetadata: Map<string, Metadata> = new Map();

  constructor(protected http: HttpClient, messageService: MessageService) {
    super(PUBLIC_DATA_API_PATH, http, messageService);
  }

  getId(element: Metadata) {
    return element.uuid;
  }

  public upload(
    blob: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (blob) {

        const formData: FormData = new FormData(),
          xhr: XMLHttpRequest = new XMLHttpRequest();

        formData.append('file', blob);

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.response));
            } else {
              reject(xhr.response);
            }
          }
        };

        xhr.open(
          'POST',
          encodeURI(
            this.url
          ),
          true
        );
        xhr.send(formData);
      }
    });
  }

  buildSearch() {
  }
}
