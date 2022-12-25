import {Component} from '@angular/core';
import {APP_VERSION, ASSET_PATH} from '../../constants/constants';
import {Router} from '@angular/router';
import {ConfigurationService} from '../../service/configuration.service';
import {KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from 'keycloak-js';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html'
})
export class SideBarComponent {
    public selected = 'home';
    public asset_path: string;
    userDetails: KeycloakProfile;
    roles: string[];

    constructor( private keycloakService: KeycloakService,
                private configurationService: ConfigurationService,
                protected router: Router) {
        configurationService.getValue(ASSET_PATH).subscribe(
            ass => this.asset_path = ass
        );
        this.refreshKeycloak();
    }

    async refreshKeycloak() {
        if (await this.keycloakService.isLoggedIn()) {
            this.userDetails = await this.keycloakService.loadUserProfile();
            this.roles = this.keycloakService.getUserRoles();
        }
    }

    async logout() {
        await this.keycloakService.logout();
    }

    public select(page: string) {
        this.selected = page;
    }


    version(): string {
        return APP_VERSION;
    }

    isContenPage() {
        const lastIndexOfSlash = this.router.url.indexOf('home')
            || this.router.url.indexOf('datalist')

        ;
        if (lastIndexOfSlash >= 0) {
            return 'active';
        } else {
            return '';
        }
    }

    isAdminPage() {
        const lastIndexOfSlash = this.router.url.indexOf('adminpage')
            || this.router.url.indexOf('metadata')
            || this.router.url.indexOf('fielddefinition')
            || this.router.url.indexOf('condition')
            || this.router.url.indexOf('document')
            || this.router.url.indexOf('publicdata')
            || this.router.url.indexOf('selectqueries')
            || this.router.url.indexOf('user')
            || this.router.url.indexOf('role')
            || this.router.url.indexOf('urlmaprules')
            || this.router.url.indexOf('link');
        if (lastIndexOfSlash >= 0) {
            return 'active';
        } else {
            return '';
        }
    }

}
