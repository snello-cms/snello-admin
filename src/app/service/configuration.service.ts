import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CONFIG_PATH} from '../constants/constants';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {

    private configurazione: any;

    constructor(private http: HttpClient) {
    }

    getConfigs(): Promise<Object> {
        console.log('loading configurations');
        return this.http.get(CONFIG_PATH) // this could be a http request
            .pipe(
                tap(config => {
                    this.configurazione = config;
                })
            )
            .toPromise();
    }

    getConfiguration(): Observable<any> {
        if (this.configurazione) {
            return of(this.configurazione);
        } else {
            return this.http.get(CONFIG_PATH);
        }
    }

    getValue(key: string): Observable<string> {
        return this.getConfiguration().pipe(
            map(config => config),
            map(config => config[key])
        );
    }
}
