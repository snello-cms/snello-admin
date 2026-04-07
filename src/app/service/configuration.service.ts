import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {CONFIG_PATH} from '../constants/constants';
import {firstValueFrom, Observable, of} from 'rxjs';
import {tap, map} from 'rxjs/operators';

type RuntimeKeycloakConfig = {
    url: string;
    realm: string;
    clientId: string;
};

export type RuntimeConfig = {
    keycloakConfig: RuntimeKeycloakConfig;
    scope?: string;
    img_path?: string;
    asset_path?: string;
    [key: string]: unknown;
};

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {

    private configurazione?: RuntimeConfig;

    constructor(private http: HttpClient) {
    }

    getConfigs(): Promise<RuntimeConfig> {
        console.log('loading configurations');
        return firstValueFrom(
            this.http.get<RuntimeConfig>(CONFIG_PATH).pipe(
                tap(config => {
                    this.configurazione = config;
                })
            )
        );
    }

    getConfiguration(): Observable<RuntimeConfig> {
        if (this.configurazione) {
            return of(this.configurazione);
        } else {
            return this.http.get<RuntimeConfig>(CONFIG_PATH);
        }
    }

    getValue(key: string): Observable<string> {
        return this.getConfiguration().pipe(
            map(config => String(config[key] ?? ''))
        );
    }
}
