import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Metadata} from '../model/metadata';
import {AbstractService} from '../common/abstract-service';
import {MessageService} from 'primeng/api';
import {ConfigurationService} from './configuration.service';
import {PUBLIC_DATA_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class PublicDatasService extends AbstractService<any> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(PUBLIC_DATA_API_PATH), http, messageService);
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
