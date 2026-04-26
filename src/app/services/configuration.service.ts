import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG_PATH } from '../constants/constants';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

type RuntimeKeycloakConfig = {
    url: string;
    realm: string;
    clientId: string;
};

export type RuntimeConfig = {
    keycloakConfig: RuntimeKeycloakConfig;
    scope?: string;
    asset_path?: string;
    [key: string]: unknown;
};

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG');

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {

    private readonly http = inject(HttpClient);
    private readonly preloaded = inject(RUNTIME_CONFIG, { optional: true });
    private readonly config$: Observable<RuntimeConfig>;

    constructor() {
        if (this.preloaded) {
            this.config$ = of(this.preloaded);
        } else {
            this.config$ = this.http.get<RuntimeConfig>(CONFIG_PATH).pipe(
                shareReplay(1)
            );
        }
    }

    getConfiguration(): Observable<RuntimeConfig> {
        return this.config$;
    }

    getValue(key: string): Observable<string> {
        return this.getConfiguration().pipe(
            map(config => String(config[key] ?? ''))
        );
    }
}
