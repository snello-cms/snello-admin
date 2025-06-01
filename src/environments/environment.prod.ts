import {KeycloakConfig} from 'keycloak-angular';

export const keycloakConfig: KeycloakConfig = {
    url: 'https://sso.kayak.love/',
    realm: 'kayak',
    clientId: 'snello-admin'
};


export const environment = {
    production: true,
    imgPath: '/snello-admin/',
    keycloakConfig,
    scope: 'openid'
};
