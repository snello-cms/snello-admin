import {KeycloakConfig} from 'keycloak-angular';

export const keycloakConfig: KeycloakConfig = {
    url: 'https://sso.inline.help/auth/',
    realm: 'inlinehelp',
    clientId: 'website'
};


export const environment = {
    production: true,
    imgPath: '/snello-admin/',
    keycloakConfig,
    scope: 'openid'
};
