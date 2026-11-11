import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable, from, throwError} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {MessageService} from 'primeng/api';
import {AbstractService} from '../common/abstract-service';
import {ConfigurationService} from './configuration.service';
import {API_SERVICE_PATH, PRINT_TEMPLATES_API_PATH} from '../constants/constants';
import {PrintTemplate} from '../models/print-template';
import {PrintResult} from '../models/print-result';

@Injectable({
    providedIn: 'root'
})
export class PrintTemplateService extends AbstractService<PrintTemplate> {

    constructor(protected http: HttpClient, messageService: MessageService, configurationService: ConfigurationService) {
        // older config.json files have no print_templates_api_path: derive it from api_service_path
        super(configurationService.getConfiguration().pipe(
            map(config => String(config[PRINT_TEMPLATES_API_PATH]
                ?? (String(config[API_SERVICE_PATH] ?? '') + '/printtemplates')))
        ), http, messageService);
    }

    getId(element: PrintTemplate) {
        return element.uuid;
    }

    buildSearch() {
        this.search = {
            name_contains: '',
            export_type: '',
            _limit: 10
        };
    }

    /**
     * Runs a print. {@code query} is a query string such as {@code city=Rome&_sort=name:asc}; parameters filter the
     * query result by column alias. Errors from the API ({"error": "..."}) are rethrown as Error(message).
     */
    print(name: string, query: string): Observable<PrintResult> {
        const params = new HttpParams({fromString: (query || '').replace(/^\?/, '')});
        console.log('[print-templates] print', name, params.toString());
        return this.withUrl(() => this.http.get(this.url + '/' + encodeURIComponent(name) + '/print', {
            params, observe: 'response', responseType: 'blob'
        })).pipe(
            map((res: HttpResponse<Blob>) => ({
                blob: res.body as Blob,
                fileName: PrintTemplateService.fileName(res.headers.get('Content-Disposition')) ?? name,
                rows: res.headers.has('X-Snello-Rows') ? Number(res.headers.get('X-Snello-Rows')) : null
            })),
            catchError((err: HttpErrorResponse) => {
                if (err.error instanceof Blob) {
                    return from(err.error.text()).pipe(switchMap(text => {
                        let message = text || err.message;
                        try {
                            message = JSON.parse(text).error ?? message;
                        } catch {
                            // not JSON: keep the raw text
                        }
                        return throwError(() => new Error(`${err.status}: ${message}`));
                    }));
                }
                return throwError(() => new Error(`${err.status}: ${err.message}`));
            })
        );
    }

    private static fileName(disposition: string | null): string | null {
        const match = disposition?.match(/filename="?([^";]+)"?/);
        return match ? match[1] : null;
    }
}
