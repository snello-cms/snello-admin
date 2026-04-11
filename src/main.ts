import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, PreloadAllModules, withHashLocation, withComponentInputBinding } from '@angular/router';
import { importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

import { provideKeycloak } from 'keycloak-angular';
import { MessageService, ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { RUNTIME_CONFIG, type RuntimeConfig } from './app/service/configuration.service';
import { BasicHttpInterceptor } from './app/service/interceptors/basic-http.interceptor';
import { MainRoutes } from './app/app-routes';
import { AppComponent } from './app/app.component';

registerLocaleData(localeIt);

const bootstrap = async (): Promise<void> => {
    const runtimeConfig = await fetch('assets/config.json').then(
        response => response.json() as Promise<RuntimeConfig>
    );

    await bootstrapApplication(AppComponent, {
        providers: [
            { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
            provideZoneChangeDetection({ eventCoalescing: true }),
            providePrimeNG({
                theme: {
                    preset: Aura
                }
            }),
            provideKeycloak({
                config: runtimeConfig.keycloakConfig,
                initOptions: {
                    onLoad: 'login-required',
                    checkLoginIframe: false
                }
            }),
            provideRouter(MainRoutes, withPreloading(PreloadAllModules), withHashLocation(), withComponentInputBinding()),
            provideHttpClient(withInterceptorsFromDi()),
            { provide: HTTP_INTERCEPTORS, useClass: BasicHttpInterceptor, multi: true },
            { provide: LOCALE_ID, useValue: 'it' },
            MessageService,
            ConfirmationService,
            importProvidersFrom(
                MonacoEditorModule.forRoot()
            )
        ]
    });
};

bootstrap().catch(err => console.error(err));
