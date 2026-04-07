import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withPreloading, PreloadAllModules, withHashLocation } from '@angular/router';
import { APP_INITIALIZER, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { firstValueFrom } from 'rxjs';

import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { MessageService, ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { ConfigurationService } from './app/service/configuration.service';
import { MainRoutes } from './app/app-routes';
import { AppComponent } from './app/app.component';

registerLocaleData(localeIt);

function initializer(keycloak: KeycloakService, configService: ConfigurationService): () => Promise<void> {
    return async (): Promise<void> => {
        await configService.getConfigs();
        const runtimeConfig = await firstValueFrom(configService.getConfiguration());

        return new Promise<void>(async (resolve, reject) => {
            try {
                await keycloak.init({
                    config: runtimeConfig.keycloakConfig,
                    initOptions: {
                        onLoad: 'login-required',
                        checkLoginIframe: false
                    },
                    loadUserProfileAtStartUp: true,
                    bearerExcludedUrls: ['assets/config.json']
                });
                resolve();
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    };
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        providePrimeNG({
            theme: {
                preset: Aura
            }
        }),
        provideRouter(MainRoutes, withPreloading(PreloadAllModules), withHashLocation()),
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: LOCALE_ID, useValue: 'it' },
        MessageService,
        ConfirmationService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializer,
            multi: true,
            deps: [KeycloakService, ConfigurationService]
        },
        importProvidersFrom(
            KeycloakAngularModule,
            MonacoEditorModule
        )
    ]
}).catch(err => console.error(err));
