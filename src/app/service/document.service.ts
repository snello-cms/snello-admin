import {Observable, Observer} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AbstractService} from '../common/abstract-service';
import {Document} from '../model/document';
import {MessageService} from 'primeng/api';
import {catchError, map} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {DOCUMENT_API_PATH} from '../constants/constants';

@Injectable({
    providedIn: 'root'
})
export class DocumentService extends AbstractService<Document> {

    private progress$: Observable<number>;
    private progress = 0;
    private progressObserver: Observer<number>;

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        super(configurationService.getValue(DOCUMENT_API_PATH), http, messageService);
        this.progress$ = new Observable<number>(observer => {
            this.progressObserver = observer;
        });

        this.updateProgress = this.updateProgress.bind(this);
    }

    public upload(
        blob: any,
        table_name: string,
        table_key: string
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            if (blob) {
                this.updateProgress(0);

                const formData: FormData = new FormData(),
                    xhr: XMLHttpRequest = new XMLHttpRequest();

                formData.append('file', blob);
                formData.append('table_name', table_name);
                formData.append('table_key', table_key);

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            resolve(JSON.parse(xhr.response));
                        } else {
                            reject(xhr.response);
                        }
                    }
                };

                this.setUploadUpdateInterval(500);

                xhr.upload.onprogress = event => {
                    this.updateProgress(Math.round((event.loaded / event.total) * 100));
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

    private setUploadUpdateInterval(interval: number): void {
        setInterval(() => {
        }, interval);
    }

    private updateProgress(progress: number): void {
        this.progress = progress;
        if (this.progressObserver) {
            this.progressObserver.next(this.progress);
        }
    }

    public getObserver(): Observable<number> {
        return this.progress$;
    }

    getId(element: Document) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            uuid: '',
            _limit: 10
        };
    }

    public simplDownload(uuid: string): Observable<any> {
        return this.httpClient.get(this.url + '/' + uuid + '/download', {responseType: 'blob'});
    }

    public downloadPath(uuid: string): string {
        return this.url + '/' + uuid + '/download';
    }

    public download(uuid: string): Observable<any> {
        return this.simplDownload(uuid)
            .pipe(
                map(res => {
                    if (res.size === 0) {
                        return null;
                    }
                    return new Blob([res], {type: 'application/octet-stream'});
                }),
                catchError(this.handleError)
            );
    }
}
